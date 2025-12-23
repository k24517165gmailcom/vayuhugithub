import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Imported Axios
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const AddCoupon = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    coupon_code: "",
    valid_from: "",
    valid_to: "",
    user_type: "ALL Users",
    space_type: "ALL Spaces",
    discount: "",
    min_price: "",
    max_price: "",
    pack_type: "ALL Spaces",
    email: "",
    mobile: "",
  });

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Handle Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validation
  const validate = () => {
    if (!form.coupon_code.trim()) return toast.error("Coupon Code is required");
    if (!form.valid_from) return toast.error("Valid From date is required");
    if (!form.valid_to) return toast.error("Valid To date is required");

    if (!form.discount || isNaN(form.discount))
      return toast.error("Enter valid discount percentage");

    if (form.user_type === "Particular User (Email)" && !form.email.trim()) {
      return toast.error("Enter user's email ID");
    }

    if (form.user_type === "Particular User (Mobile)" && !form.mobile.trim()) {
      return toast.error("Enter user's mobile number");
    }

    return true;
  };

  // ✅ Submit Handler (with JWT Authorization & Axios)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // ✅ Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to add a coupon.");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value);
      });

      // ✅ Switched to Axios POST request
      const res = await axios.post(`${API_URL}/add_coupon.php`, payload, {
        headers: {
          // Note: Axios automatically sets Content-Type for FormData
          Authorization: `Bearer ${token}`, // ✅ Send JWT Token
        },
      });

      const data = res.data; // Axios stores response in .data

      if (data.success) {
        toast.success("Coupon Added Successfully!");
        setTimeout(() => navigate("/admin/coupon-list"), 700);
      } else {
        toast.error(data?.message || "Failed to create coupon");
      }
    } catch (err) {
      // Axios stores server error responses in err.response.data
      const errorMsg = err.response?.data?.message || err.message || "Error adding coupon";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-orange-600">Create Coupon Code</h1>

        <button
          onClick={() => navigate("/admin/coupon-list")}
          className="px-3 py-1 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition"
        >
          View Coupon Codes
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Coupon Code */}
          <div>
            <label className="block text-sm mb-1 font-medium">Coupon Code *</label>
            <input
              name="coupon_code"
              value={form.coupon_code}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2"
              placeholder="Enter Coupon Code..."
            />
          </div>

          {/* Valid From / Valid To */}
          <div className="flex gap-4">
            <div className="w-full">
              <label className="block text-sm mb-1 font-medium">Valid From *</label>
              <input
                type="date"
                name="valid_from"
                value={form.valid_from}
                onChange={handleChange}
                min={today} // disable past dates
                className="w-full border border-orange-400 rounded px-3 py-2"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm mb-1 font-medium">Valid To *</label>
              <input
                type="date"
                name="valid_to"
                value={form.valid_to}
                onChange={handleChange}
                min={form.valid_from || today} // cannot be before valid_from
                className="w-full border border-orange-400 rounded px-3 py-2"
              />
            </div>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm mb-1 font-medium">Select User Type *</label>
            <select
              name="user_type"
              value={form.user_type}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2"
            >
              <option>ALL Users</option>
              <option>First Time Users</option>
              <option>Particular User (Email)</option>
              <option>Particular User (Mobile)</option>
            </select>
          </div>

          {/* Show Email Input IF needed */}
          {form.user_type === "Particular User (Email)" && (
            <div>
              <label className="block text-sm mb-1 font-medium">Enter User Email *</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
                placeholder="Enter Email ID"
              />
            </div>
          )}

          {/* Show Mobile Input IF needed */}
          {form.user_type === "Particular User (Mobile)" && (
            <div>
              <label className="block text-sm mb-1 font-medium">Enter Mobile Number *</label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
                placeholder="Enter Mobile No."
              />
            </div>
          )}

          {/* Space Type */}
          <div>
            <label className="block text-sm mb-1 font-medium">Select Space Type *</label>
            <select
              name="space_type"
              value={form.space_type}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2"
            >
              <option>ALL Spaces</option>
              <option>Workspace</option>
              <option>Group Workspace</option>
              <option>Team Lead Cubicle</option>
              <option>Manager Cubicle</option>
              <option>Video Conferencing</option>
              <option>Executive Cabin</option>
              <option>CEO Cabin</option>
            </select>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              Enter Discount in Percentage (%) *
            </label>
            <input
              name="discount"
              value={form.discount}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2"
              placeholder="Enter Discount (%)"
            />
          </div>

          {/* Price Range */}
          <div className="flex gap-4">
            <input
              name="min_price"
              value={form.min_price}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2"
              placeholder="Min Price"
            />
            <input
              name="max_price"
              value={form.max_price}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2"
              placeholder="Max Price"
            />
          </div>

          {/* Pack Type */}
          <div>
            <label className="block text-sm mb-1 font-medium">Select Pack Type *</label>
            <select
              name="pack_type"
              value={form.pack_type}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2"
            >
              <option>ALL Spaces</option>
              <option>Per Hour</option>
              <option>Per Day</option>
              <option>One Week</option>
              <option>Two Week</option>
              <option>Three Week</option>
              <option>Per Month</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCoupon;