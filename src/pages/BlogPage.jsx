import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Added Axios for Bearer Token support

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBlogs = async () => {
        try {
            // ✅ Retrieve token from localStorage
            const token = localStorage.getItem("token");

            // ✅ Switched to Axios to send Bearer Token
            const res = await axios.get(`${API_URL}/blog_list.php`, {
                params: { nocache: Date.now() },
                headers: {
                    Authorization: token ? `Bearer ${token}` : "", // ✅ Bearer Token added
                },
            });

            const data = res.data; // Axios puts response in .data

            if (data.success) {
                // Filter blogs with status "active" (case-insensitive)
                const activeBlogs = data.data.filter(
                    blog => blog.status && blog.status.toLowerCase() === "active"
                );
                setBlogs(activeBlogs);
            }
        } catch (err) {
            console.log("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    // Helper: Format date nicely
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="px-6 md:px-20 lg:px-32 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Latest Blogs</h1>

            {/* LOADING */}
            {loading ? (
                <p className="text-gray-500 text-center">Loading...</p>
            ) : blogs.length === 0 ? (
                <p className="text-gray-500 text-center">No blogs found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

                    {blogs.map((blog, index) => {
                        // ✅ Simulate dynamic date based on position
                        const simulatedDate = new Date();
                        simulatedDate.setDate(simulatedDate.getDate() - index);

                        return (
                            <div
                                key={blog.id}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                            >
                                {/* Image */}
                                <div className="w-full h-56 bg-gray-100 overflow-hidden">
                                    {blog.blog_image ? (
                                        <img
                                            src={`${API_URL}/${blog.blog_image}`}
                                            alt={blog.blog_heading}
                                            className="w-full h-56 bg-gray-100 overflow-hidden rounded-t-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                        {blog.blog_heading}
                                    </h2>

                                    {/* Short description (HTML) */}
                                    <div
                                        className="text-sm text-gray-600 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: blog.blog_description }}
                                    ></div>

                                    {/* Footer Row: Author + Date + Read More */}
                                    <div className="mt-4 text-xs flex flex-wrap items-center justify-between gap-2">

                                        {/* Posted By */}
                                        <span className="text-gray-500 whitespace-nowrap">
                                            Posted by{" "}
                                            <span className="text-orange-500 font-medium">{blog.added_by}</span>
                                        </span>

                                        {/* ✅ Simulated Rotating Date */}
                                        <span className="text-gray-400 whitespace-nowrap">
                                            {formatDate(simulatedDate)}
                                        </span>

                                        {/* Read More Button */}
                                        <button
                                            onClick={() => navigate(`/blog/${blog.id}`)}
                                            className="px-3 py-1 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 transition whitespace-nowrap"
                                        >
                                            Read More →
                                        </button>

                                    </div>

                                </div>
                            </div>
                        );
                    })}

                </div>
            )}
        </div>
    );
};

export default BlogPage;