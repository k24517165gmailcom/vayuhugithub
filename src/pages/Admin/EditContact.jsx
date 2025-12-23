import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Added Axios

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const EditContact = () => {
  const { id } = useParams(); // contact ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Get token from localStorage
  const token = localStorage.getItem("token");

  // ✅ Fetch contact details for editing
  useEffect(() => {
    const fetchContact = async () => {
      try {
        // ✅ Switched to Axios with Bearer Token
        const response = await axios.get(`${API_BASE}/get_contact_details.php?id=${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        
        const data = response.data;
        if (data.success && data.contact) {
          setFormData({
            name: data.contact.name || "",
            email: data.contact.email || "",
            phone: data.contact.phone || "",
            status: data.contact.status || "Pending",
          });
        } else {
          setMessage("Contact not found.");
        }
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || "Failed to load contact details.";
        setMessage(errorMsg);
      }
    };
    fetchContact();
  }, [id, API_BASE, token]);

  // ✅ Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ✅ Switched to Axios POST with Bearer Token
      const res = await axios.post(`${API_BASE}/update_contact.php`, {
        id,
        ...formData,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = res.data;

      if (data.success) {
        setMessage("✅ Contact updated successfully!");
        setTimeout(() => navigate("/admin/contact-list"), 1200);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-3xl border-t shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Edit Contact
          </h2>
          <button
            onClick={() => navigate("/admin/contact-list")}
            className="border border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-orange-50 transition text-sm sm:text-base"
          >
            Back to List
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">
              Name <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-orange-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-orange-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">
              Phone <span className="text-orange-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              placeholder="10-digit number"
              className="w-full border border-orange-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">
              Status <span className="text-orange-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-orange-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="Pending">Pending</option>
              <option value="Follow-Up">Follow-Up</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Contact"}
          </button>

          {/* Message */}
          {message && (
            <p
              className={`text-center text-sm mt-4 ${
                message.includes("✅")
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

export default EditContact;