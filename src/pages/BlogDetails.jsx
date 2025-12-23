import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Added Axios

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      // ✅ Retrieve token from localStorage
      const token = localStorage.getItem("token");

      // ✅ Switched to Axios with Bearer Token header
      const res = await axios.get(`${API_URL}/blog_detail.php`, {
        params: { id: id },
        headers: {
          Authorization: token ? `Bearer ${token}` : "", // ✅ Bearer Token added
        },
      });

      const data = res.data;

      if (data.success) {
        setBlog(data.blog);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-12">Loading blog...</p>;
  }

  if (!blog) {
    return (
      <p className="text-center text-gray-500 py-12">
        Blog not found or unavailable.
      </p>
    );
  }

  return (
    <div className="px-6 md:px-20 lg:px-40 py-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-orange-500 hover:text-orange-600 font-medium"
      >
        ← Back to Blogs
      </button>

      {/* Blog Header */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
        {blog.blog_heading}
      </h1>

      <div className="text-sm text-gray-500 mb-6 flex items-center gap-3">
        <span>
          Posted by <span className="text-orange-500 font-medium">{blog.added_by}</span>
        </span>
        <span>•</span>
        <span>{formatDate(blog.created_at)}</span>
      </div>

      {/* Blog Image */}
      {blog.blog_image && (
        <div className="mb-8">
          <img
            // ✅ Ensure image path works with backend URL
            src={blog.blog_image.startsWith('http') ? blog.blog_image : `${API_URL}/${blog.blog_image}`}
            alt={blog.blog_heading}
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Blog Description */}
      <div
        className="text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: blog.blog_description }}
      ></div>
    </div>
  );
};

export default BlogDetails;