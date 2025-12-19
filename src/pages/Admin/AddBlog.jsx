import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const AddBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    added_by: "",
    blog_heading: "",
    blog_description: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // -------------------------
  // ✅ Fetch User Info from LocalStorage (for added_by)
  // -------------------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
      setForm((prev) => ({ ...prev, added_by: user.name }));
    }
  }, []);

  // -------------------------
  // Handle Normal Input
  // -------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------
  // Image Handling + Memory Safe
  // -------------------------
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image (JPG, PNG, JPEG)");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const newURL = URL.createObjectURL(file);

    setImage(file);
    setPreview(newURL);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // -------------------------
  // Validation
  // -------------------------
  const validate = () => {
    if (!form.added_by.trim()) return toast.error("Adding By is required");
    if (!form.blog_heading.trim()) return toast.error("Blog Heading is required");
    if (!form.blog_description.trim())
      return toast.error("Blog Description is required");
    if (!image) return toast.error("Please upload a blog image");
    return true;
  };

  // -------------------------
  // ✅ Submit Handler (with JWT Authorization)
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to add a blog.");
      setLoading(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("added_by", form.added_by);
      payload.append("blog_heading", form.blog_heading);
      payload.append("blog_description", form.blog_description);
      payload.append("blog_image", image);

      const res = await fetch(`${API_URL}/add_blog.php`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Send JWT Token
        },
        body: payload,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (res.ok && data.success) {
        toast.success("Blog added successfully!");
        setTimeout(() => navigate("/admin/blog-list"), 700);
      } else {
        toast.error(data?.message || "Failed to add blog");
      }
    } catch (err) {
      toast.error(err.message || "Error submitting blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add New Blog</h1>

        <button
          onClick={() => navigate("/admin/blog-list")}
          className="px-3 py-1 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition"
        >
          View Blogs
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE (Fields) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Adding By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adding By <span className="text-red-500">*</span>
              </label>
              <input
                name="added_by"
                value={form.added_by}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
                placeholder="Enter Your Name..."
                 // ✅ Optional: Prevent editing if filled automatically
              />
            </div>

            {/* Blog Heading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blog Heading <span className="text-red-500">*</span>
              </label>
              <input
                name="blog_heading"
                value={form.blog_heading}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
                placeholder="Enter Blog Heading..."
              />
            </div>

            {/* Blog Description (Rich Text Editor) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Description <span className="text-red-500">*</span>
              </label>

              <ReactQuill
                value={form.blog_description}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, blog_description: html }))
                }
                className="bg-white border border-orange-400 rounded"
                theme="snow"
                placeholder="Write your blog details..."
              />
            </div>
          </div>

          {/* RIGHT SIDE (Image + Submit) */}
          <div className="space-y-6 flex flex-col items-center">
            {/* Image Preview */}
            <div className="w-full flex justify-center mt-2">
              <div className="p-2 border border-orange-300 rounded-lg bg-orange-50 shadow-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-64 h-64 object-cover rounded-md shadow-md"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">
                    No image selected
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blog Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full border border-orange-400 rounded px-3 py-2 bg-white"
                onChange={handleImageChange}
              />
            </div>

            {/* Submit */}
            <div className="pt-4 w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
