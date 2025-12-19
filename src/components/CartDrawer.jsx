import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

// ✅ Dynamic API base URL via Vite env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const CartDrawer = ({ open, onClose }) => {
  const { cart, removeFromCart, clearCart, totalAmount } = useCart();

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

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Your cart is empty!");

    const loaded = await loadRazorpayScript();
    if (!loaded) return toast.error("Razorpay SDK failed to load.");

    // 1. Create Order
    const createOrderRes = await fetch(`${API_URL}/create_razorpay_order.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount }),
    });
    const orderData = await createOrderRes.json();

    if (!orderData.success) return toast.error(orderData.message || "Failed to create order.");

    const options = {
      key: orderData.key,
      amount: totalAmount * 100,
      currency: "INR",
      name: "Vayuhu Workspaces",
      description: "Cart Checkout",
      order_id: orderData.order_id,
      theme: { color: "#F97316" },
      handler: async function (response) {
        
        // 2. Verify Payment
        const verifyRes = await fetch(`${API_URL}/verify_payment.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.success) return toast.error("Payment verification failed!");

        // 3. Prepare Bulk Data
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id || null;

        const bulkBookingData = cart.map((booking) => ({
            user_id: userId,
            space_id: booking.id,
            workspace_title: booking.title,
            plan_type: booking.plan_type,
            start_date: booking.start_date,
            end_date: booking.end_date,
            start_time: booking.start_time,
            end_time: booking.end_time,
            total_days: booking.total_days,
            total_hours: booking.total_hours,
            num_attendees: booking.num_attendees,
            final_amount: booking.final_amount,
            coupon_code: booking.coupon_code || null,
            referral_source: booking.referral || null,
            terms_accepted: 1,
            payment_id: response.razorpay_payment_id,
            
            // 🟢 FIXED: Include seat codes in the payload to backend
            seat_codes: booking.seat_codes || "" 
        }));

        // 4. Send Bulk Request
        try {
            const bookingRes = await fetch(`${API_URL}/add_bulk_bookings.php`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookings: bulkBookingData }),
            });
            
            const bookingResult = await bookingRes.json();
            
            if(!bookingResult.success) {
                throw new Error(bookingResult.message);
            }

            // 5. Send Email
            const emailPayload = {
                user_id: userId,
                user_email: user?.email,
                total_amount: totalAmount,
                bookings: cart 
            };

            await fetch(`${API_URL}/send_booking_email.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailPayload),
            });

            toast.success("🎉 All bookings confirmed!");
            clearCart();
            onClose();

        } catch (error) {
            console.error("Booking Error:", error);
            toast.error("Payment successful, but booking failed. Contact support.");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-end z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Your Cart</h3>
              <button onClick={onClose} className="text-gray-500 text-2xl">
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Cart is empty</p>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="border-b py-3">
                      <h4 className="font-semibold text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.plan_type}</p>
                      
                      {/* 🟢 FIXED: Display Selected Seats in the Cart UI */}
                      {item.seat_codes && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                           Seats: {item.seat_codes}
                        </p>
                      )}

                      <p className="text-sm text-gray-500 mt-1">
                        {item.start_date} → {item.end_date}
                      </p>
                      <p className="text-orange-600 font-medium">₹{item.final_amount}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>Total:</span> <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={clearCart}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Checkout »
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;