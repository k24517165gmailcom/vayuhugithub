import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Use environment variable
const API_URL = import.meta.env.VITE_API_URL;

const VirtualOfficeBookingModal = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(""); // Needed for Razorpay prefill
  const [userName, setUserName] = useState(""); // Needed for Razorpay prefill

  const today = new Date().toISOString().split("T")[0];

  // ✅ Helper: Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ Fetch logged-in user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
          setUserId(parsedUser.id);
          setUserEmail(parsedUser.email || "");
          setUserName(parsedUser.name || "");
        } else {
          toast.warning("⚠️ Please log in to continue.");
          setUserId(null);
        }
      } catch {
        setUserId(null);
        toast.warning("⚠️ Invalid user session. Please log in again.");
      }
    } else {
      setUserId(null);
    }
  }, [isOpen]);

  // ✅ Fetch plan details dynamically
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(
          `${API_URL}/get_virtual_office_price_list.php`
        );
        const data = await response.json();

        if (data.status === "success" && data.data.length > 0) {
          const planData = data.data[0];
          setPlan(planData.min_duration);
          setPrice(planData.price);
        } else {
          toast.error("❌ No active plan found.");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        toast.error("⚠️ Failed to load plan details.");
      }
    };

    if (isOpen) fetchPlan();
  }, [isOpen]);

  // ✅ Auto-calculate End Date
  useEffect(() => {
    if (startDate) {
      const newEnd = new Date(startDate);
      newEnd.setFullYear(newEnd.getFullYear() + 1);
      setEndDate(newEnd.toISOString().split("T")[0]);
    } else {
      setEndDate("");
    }
  }, [startDate]);

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    const selectedDate = new Date(startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (!userId) {
      toast.warning("🔒 You must be logged in to book a virtual office.");
      return false;
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required.";
    } else if (selectedDate < now) {
      newErrors.startDate = "Start date cannot be in the past.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Razorpay Payment Flow
  // ✅ Handle Razorpay Payment Flow
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // ---------------------------------------------------------
      // 🛑 STEP 1: PRE-CHECK USING SAME ENDPOINT
      // ---------------------------------------------------------
      const checkResponse = await fetch(
        `${API_URL}/virtualoffice_booking.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            check_only: true, // 👈 Checks eligibility without booking
          }),
        }
      );

      const checkData = await checkResponse.json();

      // If success is false, it means they already have a booking
      if (!checkData.success) {
        toast.info(`ℹ️ ${checkData.message}`); // "You already have an active booking"
        setLoading(false);
        return; // Stop here. No payment popup.
      }
      // ---------------------------------------------------------

      // 2. Load Razorpay Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load payment gateway.");
        setLoading(false);
        return;
      }

      // 3. Create Order
      const orderResponse = await fetch(
        `${API_URL}/create_razorpay_order.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: price }),
        }
      );

      const orderData = await orderResponse.json();
      if (!orderData.success) throw new Error(orderData.message);

      // 4. Open Payment
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Vayuhu Workspace",
        description: "Virtual Office - 1 Year",
        order_id: orderData.order_id,
        handler: async function (response) {
          // Payment Success -> Verify -> Save
          try {
            const verifyResponse = await fetch(
              `${API_URL}/verify_payment.php`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              await saveBooking(response.razorpay_payment_id);
            } else {
              toast.error("❌ Payment verification failed.");
            }
          } catch (err) {
            toast.error("⚠️ Error verifying payment.");
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: "#F97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        toast.error("Payment Failed");
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      // Only stop loading if we hit an error before opening Razorpay
      if (!document.getElementsByClassName("razorpay-container").length) {
        // setLoading(false); // Optional: keep loading true while modal opens
      }
    }
  };

  // ✅ Save Booking Function (Called after payment success)
  const saveBooking = async (paymentId) => {
    try {
      const response = await fetch(`${API_URL}/virtualoffice_booking.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          start_date: startDate,
          end_date: endDate,
          price: price,
          total_years: 1,
          payment_id: paymentId, // Send payment ID to backend
          payment_status: "Paid",
        }),
      });

      const data = await response.json();

      if (
        data.message &&
        data.message.toLowerCase().includes("already booked")
      ) {
        toast.info(
          "ℹ️ Booking exists, but payment was collected. Please contact support."
        );
        onClose();
        return;
      }

      if (data.success) {
        toast.success("🎉 Payment Successful! Virtual Office booked.");
        setTimeout(() => {
          setStartDate("");
          setEndDate("");
          onClose();
        }, 2000);
      } else {
        toast.error(`❌ Booking failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Booking save error:", error);
      toast.error(
        "⚠️ Payment succeeded but booking failed to save. Contact support."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <ToastContainer position="top-right" autoClose={3000} />
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative"
              initial={{ scale: 0.8, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-orange-500 transition"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                Book Your{" "}
                <span className="text-orange-500">Virtual Office</span>
              </h2>

              {!userId ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-4">
                    🔒 You must be logged in to book a Virtual Office.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = "/auth";
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow transition"
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Plan
                    </label>
                    <input
                      type="text"
                      value={plan || "Loading..."}
                      readOnly
                      className="w-full border rounded-xl px-4 py-3 bg-gray-100 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Price
                    </label>
                    <input
                      type="text"
                      value={price ? `₹ ${price}` : "Loading..."}
                      readOnly
                      className="w-full border rounded-xl px-4 py-3 bg-gray-100 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Start Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 outline-none transition ${
                        errors.startDate
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:ring-1"
                      }`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  {endDate && (
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        readOnly
                        className="w-full border rounded-xl px-4 py-3 bg-gray-100 text-gray-700"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl shadow-md transition-all duration-200 ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Processing..." : "Pay & Book"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VirtualOfficeBookingModal;
