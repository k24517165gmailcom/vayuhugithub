import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const BlogEditModal = ({ blog, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    blog_heading: "",
    blog_description: "",
    status: "Active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Helper to normalize status values
  const normalizeStatus = (status) => {
    if (!status) return "Active";
    const s = status.toLowerCase();
    return s === "inactive" ? "Inactive" : "Active";
  };

  useEffect(() => {
    if (blog) {
      setFormData({
        blog_heading: blog.blog_heading || "",
        blog_description: blog.blog_description || "",
        status: normalizeStatus(blog.status),
      });
      setPreview(blog.blog_image ? `${API_URL}/${blog.blog_image}` : null);
      setImageFile(null);
    }
  }, [blog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image (JPG, PNG, JPEG)");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!formData.blog_heading.trim()) return toast.error("Blog Heading is required");
    if (!formData.blog_description.trim()) return toast.error("Blog Description is required");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const updatedData = { ...formData };
    if (imageFile) updatedData.blog_image = imageFile;

    onSave(updatedData).finally(() => setLoading(false));
  };

  if (!blog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-3 bg-orange-50">
          <h2 className="text-lg font-semibold text-gray-700">Edit Blog</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-orange-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Image Upload */}
          <div className="col-span-1 md:row-span-2 flex flex-col items-center">
            <div
              onClick={handleImageClick}
              className="relative w-32 h-32 rounded-lg border-2 border-orange-400 flex items-center justify-center bg-gray-50 text-gray-400 text-5xl cursor-pointer hover:opacity-80 transition"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                "🖼️"
              )}
              <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs rounded px-1.5 py-0.5 shadow-md">
                Edit
              </div>
            </div>

            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-xs text-gray-500 mt-1">Click to change image</p>
          </div>

          {/* Blog Heading */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Blog Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="blog_heading"
              value={formData.blog_heading}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
              required
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border border-orange-400 rounded px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Blog Description (full width) */}
          <div className="col-span-1 md:col-span-3 flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-2">
              Blog Description <span className="text-red-500">*</span>
            </label>
            <div className="border border-orange-400 rounded-lg overflow-hidden shadow-sm">
              <ReactQuill
                value={formData.blog_description}
                onChange={(html) =>
                  setFormData((prev) => ({ ...prev, blog_description: html }))
                }
                theme="snow"
                className="h-60"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="col-span-1 md:col-span-3 flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BlogEditModal;
