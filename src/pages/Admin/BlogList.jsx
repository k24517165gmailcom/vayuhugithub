import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BlogEditModal from "./BlogEditModal";

// ✅ Use environment variable or fallback to localhost
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Fetch Blog List
  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_URL}/blog_list.php`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data || []);
      } else {
        toast.error("Failed to load blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Something went wrong while loading blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter (search by heading only)
  const filteredBlogs = blogs.filter((blog) =>
    (blog.blog_heading || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBlogs.length / entriesPerPage);

  // Handle save from modal
  const handleSaveBlog = async (updatedData) => {
    try {
      const payload = new FormData();
      payload.append("id", selectedBlog.id);
      payload.append("blog_heading", updatedData.blog_heading);
      payload.append("blog_description", updatedData.blog_description);
      payload.append("status", updatedData.status);
      if (updatedData.blog_image) {
        payload.append("blog_image", updatedData.blog_image);
      }

      const res = await fetch(`${API_URL}/update_blog.php`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Blog updated successfully!");
        fetchBlogs();
        setSelectedBlog(null);
      } else {
        toast.error(data.message || "Failed to update blog");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-6 mt-10">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold">Blog List</h2>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="mr-2">Show</span>
            <select
              className="border rounded px-2 py-1"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-1">entries</span>
          </div>

          <input
            type="text"
            className="border px-3 py-1 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by blog heading"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-orange-50 text-left text-gray-700">
              <th className="py-2 px-4 border">S.No.</th>
              <th className="py-2 px-4 border">Image</th>
              <th className="py-2 px-4 border">Heading</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Created At</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentBlogs.length > 0 ? (
              currentBlogs.map((item, index) => (
                <tr
                  key={item.id}
                  className="text-center hover:bg-orange-50 transition"
                >
                  <td className="py-2 px-4 border">
                    {indexOfFirst + index + 1}
                  </td>

                  {/* Image */}
                  <td className="py-2 px-4 border">
                    {item.blog_image ? (
                      <img
                        src={`${API_URL}/${item.blog_image}`}
                        alt={item.blog_heading}
                        className="w-14 h-14 rounded object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() =>
                          setPreviewImage(`${API_URL}/${item.blog_image}`)
                        }
                      />
                    ) : (
                      <div className="w-14 h-14 rounded bg-gray-200 text-gray-500 flex items-center justify-center">
                        N/A
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-4 border">{item.blog_heading}</td>

                  {/* Status */}
                  <td className="py-2 px-4 border">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        item.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-2 px-4 border">{item.created_at}</td>

                  {/* Actions */}
                  <td className="py-2 px-4 border">
                    <button
                      className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50"
                      onClick={() => setSelectedBlog(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No blogs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-2">
        <p>
          Showing {indexOfFirst + 1} to{" "}
          {Math.min(indexOfLast, filteredBlogs.length)} of{" "}
          {filteredBlogs.length} entries
        </p>

        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1 ? "bg-orange-500 text-white" : ""
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white text-gray-700 px-3 py-1 rounded-full"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Blog Edit Modal */}
      {selectedBlog && (
        <BlogEditModal
          blog={selectedBlog}
          onClose={() => setSelectedBlog(null)}
          onSave={handleSaveBlog}
        />
      )}
    </div>
  );
};

export default BlogList;
