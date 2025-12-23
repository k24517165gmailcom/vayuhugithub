import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Imported Axios
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const CompanyProfileModal = ({ userId, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    gstNo: "",
    email: "",
    contact: "",
    address: "",
  });
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // ✅ Retrieve token from localStorage
  const token = localStorage.getItem("token");

  // ✅ Fetch existing company profile using Axios
  useEffect(() => {
    if (!userId) return;

    const fetchCompanyProfile = async () => {
      try {
        // Using Axios with Authorization header
        const res = await axios.get(`${API_BASE}/get_company_profile.php?user_id=${userId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          }
        });
        const data = res.data;

        if (data.success && data.profile) {
          const profile = data.profile;
          setFormData({
            companyName: profile.company_name || "",
            gstNo: profile.gst_no || "",
            email: profile.email || "",
            contact: profile.contact || "",
            address: profile.address || "",
          });
          if (profile.logo) setPreview(profile.logo);
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
        const errorMsg = error.response?.data?.message || "Failed to load company profile";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [userId, token]);

  // ✅ Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  // ✅ Update company profile using Axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("user_id", userId);
      payload.append("companyName", formData.companyName);
      payload.append("gstNo", formData.gstNo);
      payload.append("contact", formData.contact);
      payload.append("address", formData.address);
      payload.append("email", formData.email); // read-only, just pass original
      if (logo) payload.append("logo", logo);

      // Using Axios POST with multipart/form-data and Authorization header
      const res = await axios.post(`${API_BASE}/update_company_profile.php`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = res.data;
      if (data.success) {
        toast.success("Company profile updated successfully!");
        onClose();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-3 bg-orange-50">
          <h2 className="text-lg font-semibold text-gray-700">Company Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-orange-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Logo */}
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center mb-4">
            <div
              onClick={handleLogoClick}
              className="relative w-28 h-28 rounded-full border-2 border-orange-400 flex items-center justify-center bg-gray-50 text-gray-400 text-5xl cursor-pointer hover:opacity-80 transition"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "🏢"
              )}
              <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 shadow-md">
                Edit
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1">Click to change logo</p>
          </div>

          {/* Company Name */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
              required
            />
          </div>

          {/* GST No */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">GST No</label>
            <input
              type="text"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          {/* Company Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Company Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="border border-orange-400 rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Contact <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Address</label>
            <textarea
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="col-span-1 md:col-span-2 flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfileModal;