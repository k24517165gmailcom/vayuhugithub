import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // ✅ Imported Axios

const Visitors = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  // ✅ Use Vite environment variable with fallback
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    companyName: "",
    visitingDate: "",
    visitingTime: "",
    reason: "",
  });

  const [hasReservation, setHasReservation] = useState(false);

  // ✅ Check if user has workspace bookings using Axios
  useEffect(() => {
    if (!userId) return;

    const fetchReservations = async () => {
      try {
        const response = await axios.post(
          `${API_BASE}/get_workspace_bookings.php`,
          { user_id: userId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "", // ✅ Bearer Token added
            },
          }
        );

        const data = response.data;

        if (data.success && data.bookings) {
          setHasReservation(data.bookings.length > 0);
        } else {
          setHasReservation(false);
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setHasReservation(false);
      }
    };

    fetchReservations();
  }, [userId, token]);

  // ✅ Fetch company name automatically using Axios
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${API_BASE}/get_company_profile.php`, {
        params: { user_id: userId },
        headers: {
          Authorization: token ? `Bearer ${token}` : "", // ✅ Bearer Token added
        },
      })
      .then((res) => {
        const data = res.data;
        if (data.success && data.profile) {
          setFormData((prev) => ({
            ...prev,
            companyName: data.profile.company_name || "",
          }));
        } else {
          toast.warning("No company profile found for this user");
        }
      })
      .catch(() => toast.error("Error fetching company name"));
  }, [userId, token]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submit using Axios
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.contact) {
      toast.error("Name and Contact No are required!");
      return;
    }

    // ✅ Make Visiting Date & Time mandatory always
    if (!formData.visitingDate || !formData.visitingTime) {
      toast.error("Visiting Date and Time are required!");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/add_visitor.php`,
        { ...formData, user_id: userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "", // ✅ Bearer Token added
          },
        }
      );

      const result = response.data;

      if (result.success) {
        toast.success("Visitor added successfully!");
        setTimeout(() => navigate("/visitors-details"), 1500);
      } else {
        toast.error(result.message || "Failed to add visitor!");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMsg);
    }
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Visitors</h1>
        <button
          onClick={() => navigate("/visitors-details")}
          className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all px-4 py-2 rounded-md text-sm font-medium"
        >
          Visitors Details
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow p-6">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Your Name"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter Your Contact No"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Id
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Your Email Id"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Company Name (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              readOnly
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Visiting Date & Time only if user has reservation */}
          {hasReservation && (
            <>
              {/* Visiting Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visiting Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="visitingDate"
                  value={formData.visitingDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Visiting Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visiting Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="visitingTime"
                  value={formData.visitingTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-orange-500"
                  required
                />
              </div>
            </>
          )}

          {/* Reason */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              name="reason"
              rows="3"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter Reason"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 mt-4 flex justify-center">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg shadow transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Visitors;