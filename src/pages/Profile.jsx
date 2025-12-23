import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // ✅ Imported Axios

const Profile = () => {
  // ✅ Existing States
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    dob: "1990-01-01",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL;

  // ✅ Get logged-in user info and token
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const token = localStorage.getItem("token"); // ✅ Retrieve Bearer Token

  // ✅ Fetch user data
  useEffect(() => {
    if (!userId) {
      toast.error("User not logged in!");
      setLoading(false);
      return;
    }

    // ✅ Using Axios with Bearer Token
    axios.get(`${API_BASE}/get_user_profile.php`, {
      params: { id: userId },
      headers: {
        Authorization: `Bearer ${token}` // ✅ Added Authorization Header
      }
    })
      .then((res) => {
        const data = res.data;
        if (data.success && data.user) {
          const userProfile = data.user;
          setFormData({
            name: userProfile.name || "",
            contact: userProfile.phone || "",
            email: userProfile.email || "",
            dob: userProfile.dob || "1990-01-01",
            address: userProfile.address || "",
          });
          if (userProfile.profile_pic) setPreview(userProfile.profile_pic);
        } else {
          toast.error("Failed to fetch profile");
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        toast.error("Error fetching profile");
      })
      .finally(() => setLoading(false));
  }, [userId, token]);

  // ✅ Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
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
      const formDataToSend = new FormData();
      formDataToSend.append("id", userId);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.contact);
      formDataToSend.append("dob", formData.dob);
      formDataToSend.append("address", formData.address);
      if (profilePic) formDataToSend.append("profilePic", profilePic);

      // ✅ Using Axios POST with Bearer Token
      const response = await axios.post(`${API_BASE}/update_user_profile.php`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}` // ✅ Added Authorization Header
          // Note: Axios automatically sets multipart/form-data for FormData objects
        },
      });

      const result = response.data;

      if (result.success) {
        toast.success("Profile updated successfully!");
        setProfilePic(null); // Keep form populated, only clear profilePic input
      } else {
        toast.error("Failed to update profile: " + result.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-center text-gray-600 mt-10">Loading profile...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-semibold mb-6 text-gray-800">User Profile</h1>

      <div className="bg-white rounded-2xl shadow p-6 mt-6">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          {/* Profile Picture Upload */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="w-32 h-32 rounded-full border overflow-hidden bg-gray-100">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setPreview(null);
                    setProfilePic(null);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Upload Profile Pic
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border border-gray-300 rounded-md p-2 text-sm w-60 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

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

          {/* Contact No */}
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
              disabled
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
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
              placeholder="Enter Address"
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

export default Profile;