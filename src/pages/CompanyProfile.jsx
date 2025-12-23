import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // ✅ Imported Axios

const CompanyProfile = () => {
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    gstNo: "",
    email: "",
    contact: "",
    address: "",
  });
  const [profileId, setProfileId] = useState(null); // track existing profile

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  // ✅ Retrieve token for Authorization
  const token = localStorage.getItem("token");

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

  // Fetch company profile on mount
  useEffect(() => {
    if (!userId) return;

    // ✅ Using Axios GET with Bearer Token
    axios.get(`${API_BASE}/get_company_profile.php`, {
      params: { user_id: userId },
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then((response) => {
        const data = response.data;
        if (data.success && data.profile) {
          const profile = data.profile;
          setProfileId(profile.id); // existing profile
          setFormData({
            companyName: profile.company_name || "",
            gstNo: profile.gst_no || "",
            email: profile.email || "",
            contact: profile.contact || "",
            address: profile.address || "",
          });
          if (profile.logo) setPreview(profile.logo);
        }
      })
      .catch((err) => console.error("Error fetching company profile:", err));
  }, [userId, token]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error("User not logged in!");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("user_id", userId);
      payload.append("companyName", formData.companyName);
      payload.append("gstNo", formData.gstNo);
      payload.append("email", formData.email);
      payload.append("contact", formData.contact);
      payload.append("address", formData.address);
      if (logo) payload.append("logo", logo);
      if (profileId) payload.append("id", profileId); // for update

      const url = profileId
        ? `${API_BASE}/update_company_profile.php`
        : `${API_BASE}/add_company_profile.php`;

      // ✅ Using Axios POST with Bearer Token
      // Note: Do not set Content-Type header manually when sending FormData
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = response.data;
      if (result.success) {
        toast.success(result.message);
        if (!profileId && result.profileId) setProfileId(result.profileId);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMsg);
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Company Profile
      </h1>

      <div className="bg-white rounded-2xl shadow p-6 mt-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Logo */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 mb-4">
            <div className="w-32 h-32 rounded-xl border overflow-hidden bg-gray-100 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-sm">No Logo</div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Upload Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="border border-gray-300 rounded-md p-2 text-sm w-60 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* GST No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST No
            </label>
            <input
              type="text"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Company Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly={!!profileId} // read-only if profile exists
              className={`w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                profileId ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Contact *
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="sm:col-span-2 mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg shadow transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CompanyProfile;