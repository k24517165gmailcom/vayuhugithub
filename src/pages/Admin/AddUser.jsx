import React, { useState } from "react";
import axios from "axios"; // ✅ Added Axios

const AddUser = () => {
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

    // ✅ Get Bearer Token from localStorage
    const token = localStorage.getItem("token");

    try {
      // ✅ Using Axios with Authorization Header
      const response = await axios.post(`${API_BASE}/add_user.php`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "", // ✅ Bearer Token added
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
      // ✅ Extract error message from Axios response if available
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="p-6 mt-10 flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
          Add New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone (IND) *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="10-digit phone number"
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition w-full"
          >
            Submit
          </button>

          {message && (
            <p
              className={`text-sm mt-3 text-center ${
                message.toLowerCase().includes("success") ? "text-green-600" : "text-red-500"
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

export default AddUser;