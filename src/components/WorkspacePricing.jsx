import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios"; // ✅ Added Axios
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import FloatingCartButton from "../components/FloatingCartButton";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper to get logged-in user id
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || null;
  } catch {
    return null;
  }
};

const DAY_ABBREVIATIONS_MAP = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const generateTimeOptions = () => {
  const times = [];
  // Workspace hours 08:00 AM → 07:59 PM
  for (let i = 8; i <= 19; i++) {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "AM" : "PM";
    const timeValue = `${i.toString().padStart(2, "0")}:00`;
    const display = `${hour.toString().padStart(2, "0")}:00 ${ampm}`;
    times.push({ value: timeValue, display });
  }
  return times;
};

const generateMonthOptions = () => {
  const options = [];
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const value = `${year}-${month}-01`;
    options.push({ value, label });
  }
  return options;
};

const MONTH_OPTIONS = generateMonthOptions();
const TIME_OPTIONS = generateTimeOptions();

const format24HourTo12Hour = (time24) => {
  if (!time24) return "";
  try {
    const [hours24, minutes] = time24.split(":");
    let hours = parseInt(hours24, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  } catch {
    return time24;
  }
};

const getDaysOfWeekInDateRange = (start, end) => {
  const startObj = new Date(start);
  const endObj = new Date(end);
  if (!start || !end || startObj > endObj) return "";
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const standardWorkingOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const daysFoundIndices = new Set();
  let current = new Date(startObj);
  while (current <= endObj) {
    const dayIndex = current.getDay();
    if (dayIndex !== 0) daysFoundIndices.add(dayIndex);
    current.setDate(current.getDate() + 1);
  }
  if (daysFoundIndices.size === 0) return "";
  const presentWorkingDays = standardWorkingOrder.filter((day) =>
    daysFoundIndices.has(dayNames.indexOf(day))
  );
  const startDayName = dayNames[startObj.getDay()];
  const startIndex = presentWorkingDays.indexOf(startDayName);
  const rotated =
    startIndex !== -1
      ? presentWorkingDays
          .slice(startIndex)
          .concat(presentWorkingDays.slice(0, startIndex))
      : presentWorkingDays;
  return rotated.map((d) => DAY_ABBREVIATIONS_MAP[d]).join(", ");
};

const getDayAbbreviation = (dateString) => {
  if (!dateString) return "";
  const dayName = new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
  });
  return DAY_ABBREVIATIONS_MAP[dayName] || dayName;
};

const WorkspacePricing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.plan;

  // workspaces from backend
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & booking states
  const [modalData, setModalData] = useState(null);
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [referral, setReferral] = useState("");
  const [days, setDays] = useState(0);
  const [totalHours, setTotalHours] = useState(1);
  const [numAttendees, setNumAttendees] = useState(1);

  // Seat selection modal
  const [codeSelectModal, setCodeSelectModal] = useState(null);

  const { addToCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  // ✅ Retrieve Bearer Token
  const token = localStorage.getItem("token");

  useEffect(() => {
    // ✅ Switched to Axios
    axios.get(`${API_BASE_URL}/get_spaces.php`)
      .then((response) => {
        const data = response.data;
        if (data.success) {
          const formatted = data.spaces
            .filter((i) => i.status === "Active")
            .map((i) => ({
              id: i.id,
              title: i.space,
              desc: i.min_duration_desc || "",
              type: i.space_code,
              capacity: Number(i.capacity) || 10,
              monthly: Number(i.per_month) || null,
              daily: Number(i.per_day) || null,
              hourly: Number(i.per_hour) || null,
              image: i.image_url,
              status: i.status || "Active",
              raw: i,
            }));
          setWorkspaces(formatted);
        } else {
          setError("No spaces found");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load workspace data");
        setLoading(false);
      });
  }, [API_BASE_URL]);

  const groupedWorkspaces = useMemo(() => {
    const map = new Map();
    workspaces.forEach((w) => {
      const key = `${w.title}||${w.hourly ?? 0}||${w.daily ?? 0}||${
        w.monthly ?? 0
      }`;
      if (!map.has(key)) {
        map.set(key, {
          title: w.title,
          desc: w.desc,
          image: w.image,
          hourly: w.hourly,
          daily: w.daily,
          monthly: w.monthly,
          items: [{ id: w.id, code: w.type, raw: w.raw }],
          capacity: w.capacity,
        });
      } else {
        map.get(key).items.push({ id: w.id, code: w.type, raw: w.raw });
      }
    });
    return Array.from(map.values());
  }, [workspaces]);

  const isAuthenticated = () => {
    const user = localStorage.getItem("user");
    return !!user;
  };

  useEffect(() => {
    if (!startDate || !modalData?.planType) return;
    const start = new Date(startDate);
    let end = new Date(start);

    if (modalData.planType === "Monthly") {
      if (!endDate) {
        end.setMonth(start.getMonth() + 1);
        end.setDate(end.getDate() - 1);
        setEndDate(end.toISOString().split("T")[0]);
      }
    } else if (modalData.planType === "Daily") {
      end = new Date(start);
      setEndDate(end.toISOString().split("T")[0]);
    } else if (modalData.planType === "Hourly") {
      end = new Date(start);
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, [startDate, modalData?.planType]);

  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (e < s) return setDays(0);
      const diff = e - s;
      const d = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
      setDays(d);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (modalData?.planType === "Hourly" && startTime) {
      const startHour = parseInt(startTime.split(":")[0]);
      const endHour = Math.min(19, startHour);
      setEndTime(`${endHour.toString().padStart(2, "0")}:59`);
    }
  }, [startTime, modalData?.planType]);

  const handleApplyCoupon = async () => {
    if (!coupon) return toast.error("Please enter a coupon code");

    try {
      // ✅ Switched to Axios with Authorization header
      const res = await axios.post(`${API_BASE_URL}/apply_coupon.php`, {
          coupon_code: coupon,
          workspace_title: modalData?.title,
          plan_type: modalData?.planType,
          total_amount: calculateBaseAmount(),
          user_id: getUserId(),
        }, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "" 
        }
      });

      const data = res.data;

      if (data.success) {
        setDiscount(Number(data.discount_amount || 0));
        toast.success(data.message || "Coupon applied successfully!");
      } else {
        setDiscount(0);
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (err) {
      toast.error("Error validating coupon. Please try again.");
    }
  };

  const calculateBaseAmount = () => {
    const price = modalData?.price || 0;
    const count = modalData?.seatCount || 1;

    if (modalData?.planType === "Daily") {
      return price * days * count;
    }
    if (modalData?.planType === "Monthly") {
      const months = Math.max(1, Math.round(days / 30));
      return price * months * count;
    }
    if (modalData?.planType === "Hourly") {
      const attendees = count > 1 ? count : numAttendees;
      return price * totalHours * days * attendees;
    }
    return 0;
  };

  const calculateTotal = () => {
    const base = calculateBaseAmount();
    const gst = base * 0.18;
    return base + gst - discount;
  };

  const resetState = () => {
    setModalData(null);
    setStep(1);
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setTermsAccepted(false);
    setCoupon("");
    setDiscount(0);
    setReferral("");
    setDays(0);
    setTotalHours(1);
    setNumAttendees(1);
    setCodeSelectModal(null);
  };

  const handlePlanClick = (group, planType) => {
    if (!isAuthenticated()) {
      toast.error("Please log in to book a workspace!");
      setTimeout(() => navigate("/auth"), 1000);
      return;
    }

    const normalizedPlan =
      planType.toLowerCase() === "hourly"
        ? "Hourly"
        : planType.toLowerCase() === "daily"
        ? "Daily"
        : "Monthly";

    if (group.items.length > 1) {
      setCodeSelectModal({
        groupTitle: group.title,
        codes: group.items,
        planType: normalizedPlan,
        price:
          normalizedPlan === "Hourly"
            ? group.hourly
            : normalizedPlan === "Daily"
            ? group.daily
            : group.monthly,
        selectedIds: [],
      });
      return;
    }

    const sole = group.items[0];
    const chosenRaw = sole.raw;

    setModalData({
      id: sole.id,
      title: group.title,
      desc: group.desc,
      type: sole.code,
      capacity: group.capacity,
      planType: normalizedPlan,
      price:
        normalizedPlan === "Hourly"
          ? group.hourly
          : normalizedPlan === "Daily"
          ? group.daily
          : group.monthly,
      raw: chosenRaw,
      seatCount: 1,
      selectedCodes: sole.code,
    });

    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setStep(1);

    if (normalizedPlan === "Hourly") {
      const now = new Date();
      now.setHours(now.getHours() + (now.getMinutes() > 0 ? 1 : 0), 0, 0, 0);
      const h = now.getHours();
      setStartTime(`${h.toString().padStart(2, "0")}:00`);
      const nextHour = Math.min(19, h + 1);
      setEndTime(`${nextHour.toString().padStart(2, "0")}:59`);
    } else {
      setStartTime("08:00");
      setEndTime("20:00");
    }

    setNumAttendees(1);
  };

  const confirmCodeSelection = (selectedIds, planType) => {
    if (!selectedIds || selectedIds.length === 0) {
      toast.error("Please select at least one seat.");
      return;
    }

    const selectedItems = workspaces.filter((w) => selectedIds.includes(w.id));
    if (selectedItems.length === 0) {
      toast.error("Selected space not found");
      setCodeSelectModal(null);
      return;
    }

    const primary = selectedItems[0];
    const codesString = selectedItems.map((i) => i.type).join(", ");

    const normalizedPlan =
      planType.toLowerCase() === "hourly"
        ? "Hourly"
        : planType.toLowerCase() === "daily"
        ? "Daily"
        : "Monthly";

    setModalData({
      id: primary.id,
      allIds: selectedIds,
      title: primary.title,
      desc: primary.desc,
      type: codesString,
      capacity: primary.capacity,
      planType: normalizedPlan,
      price:
        normalizedPlan === "Hourly"
          ? primary.hourly
          : normalizedPlan === "Daily"
          ? primary.daily
          : primary.monthly,
      raw: primary.raw,
      seatCount: selectedIds.length,
      selectedCodes: codesString,
    });

    setCodeSelectModal(null);

    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setStep(1);

    if (normalizedPlan === "Hourly") {
      const now = new Date();
      now.setHours(now.getHours() + (now.getMinutes() > 0 ? 1 : 0), 0, 0, 0);
      const h = now.getHours();
      setStartTime(`${h.toString().padStart(2, "0")}:00`);
      const nextHour = Math.min(19, h + 1);
      setEndTime(`${nextHour.toString().padStart(2, "0")}:59`);
    } else {
      setStartTime("08:00");
      setEndTime("20:00");
    }

    setNumAttendees(selectedIds.length);
  };

  const displayAmount = calculateBaseAmount();
  const displayGst = (displayAmount * 0.18).toFixed(0);
  const totalPreDiscount = (displayAmount + Number(displayGst)).toFixed(0);
  const finalTotal = calculateTotal().toFixed(0);

  const checkAvailabilityAndProceed = async () => {
    if (!startDate) return;
    if (modalData.planType === "Hourly" && (!startTime || !endTime)) return;

    const toastId = toast.loading("Checking availability...");

    try {
      let checkEndDate = endDate;
      if (!checkEndDate && modalData.planType === "Monthly") {
        const s = new Date(startDate);
        s.setMonth(s.getMonth() + 1);
        s.setDate(s.getDate() - 1);
        checkEndDate = s.toISOString().split("T")[0];
      } else if (!checkEndDate) {
        checkEndDate = startDate;
      }

      // ✅ Switched to Axios with Authorization header
      const response = await axios.post(`${API_BASE_URL}/check_workspace_availability.php`, {
          space_id: modalData.id,
          plan_type: modalData.planType.toLowerCase(),
          start_date: startDate,
          end_date: checkEndDate,
          start_time: startTime,
          end_time: endTime,
          all_space_ids: modalData.allIds || [modalData.id],
        }, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        }
      });

      const data = response.data;
      toast.dismiss(toastId);

      if (data.success) {
        setStep(2);
      } else {
        if (data.available_slots?.length) {
          const slots = data.available_slots
            .map((slot) => `• ${slot}`)
            .join("\n");
          toast.error(
            <div>
              <p className="font-bold">{data.message}</p>
              <div className="mt-2 text-xs bg-white text-red-600 p-2 rounded max-h-40 overflow-auto">
                <strong>Available Slots:</strong>
                <pre className="whitespace-pre-wrap mt-1">{slots}</pre>
              </div>
            </div>,
            { autoClose: 8000 }
          );
        } else {
          toast.error(data.message || "Selected slot is unavailable.");
        }
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Network error checking availability.");
    }
  };

  const renderSeat = (c) => {
    const isSelected = codeSelectModal.selectedIds.includes(c.id);
    const isDisabled = !c.raw.is_available;

    return (
      <motion.button
        key={c.id}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        disabled={isDisabled}
        title={
          isDisabled
            ? (() => {
                const reason = c.raw.availability_reason || "";
                const endDate = c.raw.end_date || "";
                const endTime = c.raw.end_time || "";
                if (
                  endTime &&
                  endDate === new Date().toISOString().split("T")[0]
                ) {
                  const [hour, minute] = endTime.split(":");
                  const formattedHour = hour % 12 || 12;
                  const ampm = hour >= 12 ? "PM" : "AM";
                  return `Booked until ${formattedHour}:${minute} ${ampm} today`;
                }
                return reason;
              })()
            : isSelected
            ? "Click to Deselect"
            : "Available"
        }
        onClick={() => {
          if (!isDisabled) {
            setCodeSelectModal((prev) => {
              const current = prev.selectedIds;
              if (current.includes(c.id)) {
                return {
                  ...prev,
                  selectedIds: current.filter((id) => id !== c.id),
                };
              } else {
                return { ...prev, selectedIds: [...current, c.id] };
              }
            });
          }
        }}
        className={`w-14 h-10 rounded-md flex items-center justify-center text-xs font-semibold transition-all border
        ${
          isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : isSelected
            ? "bg-orange-500 text-white border-orange-600 scale-105 shadow-md"
            : "bg-green-100 text-gray-700 border-green-300 hover:bg-green-200"
        }`}
      >
        {c.code}
      </motion.button>
    );
  };

  const monthlyEndOptions = useMemo(() => {
    if (!startDate || modalData?.planType !== "Monthly") return [];

    const options = [];
    const start = new Date(startDate);

    for (let i = 1; i <= 12; i++) {
      const end = new Date(start);
      end.setMonth(start.getMonth() + i);
      end.setDate(end.getDate() - 1);

      const dateStr = end.toISOString().split("T")[0];
      const label = end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      options.push({
        value: dateStr,
        label: `${label} (${i} Month${i > 1 ? "s" : ""})`,
      });
    }
    return options;
  }, [startDate, modalData]);

  return (
    <section
      id="WorkSpaces"
      className="container mx-auto px-6 md:px-20 lg:px-32 py-20 relative"
    >
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="text-center mb-12">
        <h6 className="uppercase text-orange-500 tracking-widest font-medium">
          Pricing
        </h6>
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">
          Workspace Plans
        </h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
          Choose the workspace that fits your needs. Flexible pricing for
          hourly, daily, or monthly use.
        </p>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500 text-lg">
          Loading workspaces...
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500 text-lg">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {groupedWorkspaces.map((group, idx) => (
            <motion.div
              key={`${group.title}-${idx}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2, delay: 0 },
              }}
              className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200"
            >
              <img
                src={group.image}
                alt={group.title}
                className="w-full h-56 bg-gray-100 overflow-hidden rounded-t-lg object-cover"
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {group.title}
                </h3>
                <p className="text-gray-600 mb-2">{group.desc}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {group.items.length > 1 ? (
                    <span className="italic text-sm text-gray-600">
                      Multiple space codes available ({group.items.length})
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Code: {group.items[0].code}
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap">
                  {group.hourly && (
                    <button
                      onClick={() => handlePlanClick(group, "hourly")}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                    >
                      Hourly ₹{group.hourly}
                    </button>
                  )}
                  {group.daily && (
                    <button
                      onClick={() => handlePlanClick(group, "daily")}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                    >
                      Daily ₹{group.daily}
                    </button>
                  )}
                  {group.monthly && (
                    <button
                      onClick={() => handlePlanClick(group, "monthly")}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                    >
                      Monthly ₹{group.monthly}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* BookMyShow-style Space Code Selection Modal */}
      <AnimatePresence>
        {codeSelectModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-10 w-full max-w-2xl shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setCodeSelectModal(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                Select Space Codes for{" "}
                <span className="text-orange-500">
                  {codeSelectModal.groupTitle}
                </span>
              </h3>
              <p className="text-center text-gray-500 text-sm mb-6">
                Click to select multiple seats
              </p>

              <div className="flex flex-col items-center gap-5 mb-6">
                {(() => {
                  const seats = [...codeSelectModal.codes].sort((a, b) =>
                    a.code.localeCompare(b.code, undefined, { numeric: true })
                  );

                  const noWalkway = [
                    "Team Leads Cubicle",
                    "Manager Cubicle",
                    "Executive Cabin",
                  ].includes(codeSelectModal.groupTitle);

                  return (
                    <>
                      <div className="flex justify-center gap-4">
                        {seats.slice(0, 3).map(renderSeat)}
                      </div>
                      {!noWalkway && (
                        <div className="w-3/4 border-t border-gray-300 my-2"></div>
                      )}
                      <div className="flex justify-center gap-4">
                        {seats.slice(3, 10).map(renderSeat)}
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex justify-center gap-4">
                          {seats.slice(10, 17).map(renderSeat)}
                        </div>
                        {!noWalkway && (
                          <div className="w-3/4 border-t border-gray-300 my-2"></div>
                        )}
                        <div className="flex justify-center gap-4">
                          {seats.slice(17, 24).map(renderSeat)}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex justify-center gap-4">
                          {seats.slice(24, 31).map(renderSeat)}
                        </div>
                        {!noWalkway && (
                          <div className="w-3/4 border-t border-gray-300 my-2"></div>
                        )}
                        <div className="flex justify-center gap-4">
                          {seats.slice(31, 38).map(renderSeat)}
                        </div>
                      </div>
                      <div className="flex justify-center gap-4">
                        {seats.slice(38, 45).map(renderSeat)}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex justify-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-100 border border-green-300 rounded-md"></span>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-500 border border-orange-600 rounded-md"></span>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-gray-200 border border-gray-300 rounded-md"></span>
                  <span>Unavailable</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 items-center">
                <span className="text-sm font-semibold text-gray-700 mr-2">
                  {codeSelectModal.selectedIds.length} seat(s) selected
                </span>
                <button
                  onClick={() => setCodeSelectModal(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={codeSelectModal.selectedIds.length === 0}
                  onClick={() => {
                    confirmCodeSelection(
                      codeSelectModal.selectedIds,
                      codeSelectModal.planType
                    );
                  }}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                    codeSelectModal.selectedIds.length > 0
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal (Steps 1-3) */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => resetState()}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {modalData.title} - {modalData.planType} Plan
                </h3>

                {modalData.seatCount > 1 && (
                  <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    <strong>Note:</strong> You are booking {modalData.seatCount}{" "}
                    seats: {modalData.selectedCodes}
                  </div>
                )}

                <p className="text-gray-600 mb-4">
                  Choose your required timings for the workspace plan &{" "}
                  {modalData.planType.toLowerCase()} pack
                </p>

                <label className="block text-gray-700 mb-2">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    if (!dateStr) {
                      setStartDate("");
                      return;
                    }
                    // Check if selected day is Sunday
                    const day = new Date(dateStr).getUTCDay(); 
                    if (day === 0) {
                      toast.error(
                        "Workspaces are closed on Sundays. Please select another date."
                      );
                      setStartDate(""); 
                    } else {
                      setStartDate(dateStr);
                    }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                />
                <p className="text-sm text-gray-500 mb-3">
                  You can select a start date within the next 2 months only.
                </p>

                {modalData.planType === "Hourly" && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Start Time:
                        </label>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="" disabled>
                            Select Start Time
                          </option>
                          {TIME_OPTIONS.map((t) => {
                            const now = new Date();
                            const currentTimeValue = `${now
                              .getHours()
                              .toString()
                              .padStart(2, "0")}:00`;

                            const isToday =
                              startDate ===
                              new Date().toISOString().split("T")[0];

                            const isPast =
                              isToday && t.value <= currentTimeValue;

                            return (
                              <option
                                key={t.value}
                                value={t.value}
                                disabled={isPast}
                              >
                                {t.display} {isPast ? "(Past)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          End Time:
                        </label>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          disabled={!startTime}
                        >
                          <option value="" disabled>
                            Select End Time
                          </option>
                          {(() => {
                            const startHour = startTime
                              ? parseInt(startTime.split(":")[0])
                              : -1;

                            const options = [];
                            for (let i = startHour; i <= 19; i++) {
                              if (i >= startHour) {
                                const hour24 = i;
                                const labelHour =
                                  hour24 % 12 === 0 ? 12 : hour24 % 12;
                                const ampm = hour24 < 12 ? "AM" : "PM";
                                options.push({
                                  value: `${hour24
                                    .toString()
                                    .padStart(2, "0")}:59`,
                                  label: `${labelHour
                                    .toString()
                                    .padStart(2, "0")}:59 ${ampm}`,
                                });
                              }
                            }

                            return options.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>

                    {modalData.title === "Video Conferencing" && (
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                          Number of Attendees:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={modalData.capacity}
                          value={numAttendees}
                          onChange={(e) => {
                            const val = Math.max(
                              1,
                              Math.min(
                                modalData.capacity,
                                parseInt(e.target.value) || 1
                              )
                            );
                            setNumAttendees(val);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          placeholder={`Max ${modalData.capacity} persons`}
                          disabled={
                            modalData.seatCount > 1 &&
                            modalData.title !== "Video Conferencing"
                          }
                        />
                      </div>
                    )}
                  </>
                )}

                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  Accept Terms & Conditions
                </label>

                <button
                  disabled={
                    !termsAccepted ||
                    !startDate ||
                    (modalData.planType === "Hourly" &&
                      (!startTime ||
                        !endTime ||
                        totalHours <= 0 ||
                        numAttendees < 1))
                  }
                  onClick={checkAvailabilityAndProceed}
                  className={`w-full py-2 rounded-lg font-medium transition ${
                    termsAccepted &&
                    startDate &&
                    totalHours > 0 &&
                    numAttendees >= 1
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next »
                </button>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => resetState()}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  <span className="text-red-500 font-bold uppercase">
                    CHOOSE YOUR END DATE FOR RECURSION
                  </span>
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {modalData.title} & {modalData.planType} Pack
                  {modalData.planType === "Hourly" && startTime && endTime && (
                    <>
                      {" "}
                      from {format24HourTo12Hour(startTime)} to{" "}
                      {format24HourTo12Hour(endTime)}
                    </>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Start Date:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      End Date:
                    </label>

                    {modalData.planType === "Monthly" ? (
                      <select
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        {monthlyEndOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="date"
                        value={endDate}
                        readOnly
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-gray-100 cursor-not-allowed text-gray-600"
                      />
                    )}

                    <p className="text-sm text-gray-500 mt-1">
                      {modalData.planType === "Monthly"
                        ? "Select duration (1 month, 2 months, etc.)"
                        : "End date is auto-calculated based on your selected plan."}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    « Back
                  </button>
                  <button
                    disabled={
                      !endDate || new Date(endDate) < new Date(startDate)
                    }
                    onClick={() => setStep(3)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      endDate && new Date(endDate) >= new Date(startDate)
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next »
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-xl relative overflow-y-auto max-h-[90vh]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => resetState()}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>

                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  <span className="text-red-500 font-bold uppercase">
                    REVIEW DETAILS
                  </span>
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Selected Dates: {startDate} – {endDate} ({days} days)
                  {modalData.planType === "Hourly" &&
                    ` (${totalHours} hours/day)`}
                  {modalData.title === "Video Conferencing" &&
                    ` for ${numAttendees} person(s)`}
                </p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Plan</label>
                    <input
                      value={modalData.title}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Pack</label>
                    <input
                      value={modalData.planType}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {modalData.seatCount > 1 && (
                    <div className="col-span-2">
                      <label className="block text-gray-700 mb-1">
                        Selected Seats ({modalData.seatCount})
                      </label>
                      <input
                        value={modalData.selectedCodes}
                        readOnly
                        className="w-full border rounded-lg px-3 py-2 bg-orange-50 font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 mb-1">
                      {modalData.planType === "Monthly"
                        ? "No of Days:"
                        : "No of Days"}
                    </label>
                    <input
                      value={days}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Days:</label>
                    <input
                      value={
                        modalData.planType === "Monthly"
                          ? getDaysOfWeekInDateRange(startDate, endDate)
                          : days === 1
                          ? getDayAbbreviation(startDate)
                          : `${days} Days Recurrence`
                      }
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      value={startDate}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">End Date</label>
                    <input
                      value={endDate}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      value={
                        modalData.planType === "Hourly"
                          ? format24HourTo12Hour(startTime)
                          : "08:00 AM"
                      }
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">End Time</label>
                    <input
                      value={
                        modalData.planType === "Hourly"
                          ? format24HourTo12Hour(endTime)
                          : "08:00 PM"
                      }
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Amount (
                      {modalData.title === "Video Conferencing" &&
                      modalData.planType === "Hourly"
                        ? `₹${modalData.price}/hr/person`
                        : `₹${
                            modalData.price
                          }/${modalData.planType.toLowerCase()}`}
                      )
                    </label>
                    <input
                      value={`₹${displayAmount.toFixed(0)}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      GST (18%)
                    </label>
                    <input
                      value={`₹${displayGst}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Total (Pre-Discount)
                    </label>
                    <input
                      value={`₹${totalPreDiscount}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Apply Coupon
                    </label>
                    <div className="flex">
                      <input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter code"
                        className="border rounded-l-lg px-3 py-2 w-full"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Discount</label>
                    <input
                      value={`₹${discount}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Final Total (including GST)
                    </label>
                    <input
                      value={`₹${finalTotal}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 font-semibold"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">
                      Select Referral Source
                    </label>
                    <select
                      value={referral}
                      onChange={(e) => setReferral(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                      <option>Google</option>
                      <option>friend</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between mt-6 gap-2 flex-wrap">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    « Back
                  </button>

                  <button
                    onClick={() => {
                      const bookingItem = {
                        id: modalData.id,
                        title: modalData.title,
                        plan_type: modalData.planType,
                        start_date: startDate,
                        end_date: endDate,
                        start_time: startTime,
                        end_time: endTime,
                        total_days: days,
                        total_hours: totalHours,
                        num_attendees: numAttendees,
                        final_amount: parseFloat(finalTotal),
                        seat_codes: modalData.selectedCodes,
                      };
                      addToCart(bookingItem);
                      toast.success("✅ Added to cart!");
                      resetState();
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={async () => {
                      // ✅ Start of Pay & Book logical chain using Axios
                      try {
                        const availabilityResponse = await axios.post(`${API_BASE_URL}/check_workspace_availability.php`, {
                          space_id: modalData.id,
                          plan_type: modalData.planType.toLowerCase(),
                          start_date: startDate,
                          end_date: endDate,
                          start_time: startTime,
                          end_time: endTime,
                          all_space_ids: modalData.allIds || [modalData.id],
                        }, { headers: { Authorization: token ? `Bearer ${token}` : "" } });

                        const availData = availabilityResponse.data;

                        if (!availData.success) {
                          if (availData.available_slots?.length) {
                            const slots = availData.available_slots.map((slot) => `• ${slot}`).join("\n");
                            toast.error(`${availData.message}\n\nAvailable Slots:\n${slots}`, { autoClose: 5000 });
                          } else {
                            toast.error(availData.message);
                          }
                          return;
                        }

                        // Load Razorpay Script
                        const script = document.createElement("script");
                        script.src = "https://checkout.razorpay.com/v1/checkout.js";
                        script.onload = async () => {
                          const bookingData = {
                            user_id: getUserId(),
                            space_id: modalData.id,
                            all_space_ids: modalData.allIds || [modalData.id],
                            workspace_title: modalData.title,
                            plan_type: modalData.planType,
                            start_date: startDate,
                            end_date: endDate,
                            start_time: startTime || null,
                            end_time: endTime || null,
                            total_days: days,
                            total_hours: totalHours,
                            num_attendees: numAttendees,
                            price_per_unit: modalData.price,
                            base_amount: displayAmount,
                            gst_amount: parseFloat(displayGst),
                            discount_amount: discount,
                            final_amount: parseFloat(finalTotal),
                            coupon_code: coupon || null,
                            referral_source: referral || null,
                            terms_accepted: 1,
                            seat_codes: modalData.selectedCodes,
                          };

                          // 1. Create Razorpay Order
                          const orderRes = await axios.post(`${API_BASE_URL}/create_razorpay_order.php`, {
                            amount: bookingData.final_amount,
                          }, { headers: { Authorization: token ? `Bearer ${token}` : "" } });

                          const orderData = orderRes.data;
                          if (!orderData.success) throw new Error(orderData.message);

                          const options = {
                            key: orderData.key,
                            amount: bookingData.final_amount * 100,
                            currency: "INR",
                            name: "Vayuhu Workspaces",
                            description: `${modalData.title} Booking`,
                            order_id: orderData.order_id,
                            handler: async (response) => {
                              // 2. Verify Payment
                              const verifyRes = await axios.post(`${API_BASE_URL}/verify_payment.php`, response, {
                                headers: { Authorization: token ? `Bearer ${token}` : "" }
                              });

                              if (verifyRes.data.success) {
                                // 3. Finalize Booking
                                const finalBooking = await axios.post(`${API_BASE_URL}/add_workspace_booking.php`, bookingData, {
                                  headers: { Authorization: token ? `Bearer ${token}` : "" }
                                });

                                if (finalBooking.data.success) {
                                  toast.success("🎉 Booking confirmed!");
                                  const userData = JSON.parse(localStorage.getItem("user"));
                                  const bookingId = finalBooking.data.booking_id || finalBooking.data.id || 0;

                                  // 4. Send Confirmation Email
                                  await axios.post(`${API_BASE_URL}/send_booking_email.php`, {
                                    booking_id: bookingId,
                                    user_name: userData?.name || "Customer",
                                    user_id: getUserId(),
                                    user_email: userData?.email || "",
                                    workspace_title: modalData.title,
                                    plan_type: modalData.planType,
                                    start_date: startDate,
                                    end_date: endDate,
                                    start_time: startTime,
                                    end_time: endTime,
                                    total_amount: finalTotal,
                                    seat_codes: modalData.selectedCodes,
                                  }, { headers: { Authorization: token ? `Bearer ${token}` : "" } });

                                  setTimeout(() => resetState(), 2000);
                                } else {
                                  toast.error(finalBooking.data.message || "Booking registration failed");
                                }
                              } else {
                                toast.error("Payment verification failed!");
                              }
                            },
                            theme: { color: "#F97316" },
                          };
                          new window.Razorpay(options).open();
                        };
                        document.body.appendChild(script);
                      } catch (err) {
                        toast.error("Process failed: " + (err.response?.data?.message || err.message));
                      }
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Pay & Book »
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          toast.info("Proceeding to checkout...");
        }}
      />

      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
        <FloatingCartButton onClick={() => setCartOpen(true)} />
      </div>
    </section>
  );
};

export default WorkspacePricing;