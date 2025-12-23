import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Imported Axios

const AddContact = () => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Get token from localStorage
    const token = localStorage.getItem("token");

    try {
      // ✅ Using Axios for POST request
      const response = await axios.post(`${API_BASE}/add_contact.php`, formData, {
        headers: { 
          "Content-Type": "application/json",
          // ✅ Added Bearer Token to headers
          "Authorization": token ? `Bearer ${token}` : "" 
        },
      });

      // ✅ Axios stores response in .data
      const result = response.data;
      setMessage(result.message);

      if (result.status === "success" || result.success === true) {
        setFormData({ name: "", email: "", phone: "" });
      }
    } catch (error) {
      console.error("Error:", error);
      // ✅ Handle Axios specific error messages
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 flex justify-center">
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 w-full max-w-3xl border-t">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Add New Contact
          </h2>
          <button
            onClick={() => navigate("/admin/contact-list")}
            className="border border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-orange-50 transition text-sm sm:text-base"
          >
            Contact Request List
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-700 mb-1 text-sm sm:text-base">
              Name <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter a Name.."
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-orange-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm sm:text-base"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1 text-sm sm:text-base">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Your valid email.."
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-orange-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm sm:text-base"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 mb-1 text-sm sm:text-base">
              Phone (IND) <span className="text-orange-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="1234567890"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              className="w-full border border-orange-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm sm:text-base"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full sm:w-auto bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition text-sm sm:text-base"
          >
            Submit
          </button>

          {/* Message */}
          {message && (
            <p
              className={`text-sm mt-3 text-center ${
                message.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddContact;