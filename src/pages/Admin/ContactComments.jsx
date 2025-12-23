import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Imported Axios

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const ContactComments = () => {
  const { id } = useParams(); // ✅ Get contact ID from URL
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [formData, setFormData] = useState({
    status: "Pending",
    newComment: "",
  });
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Retrieve token from localStorage
  const token = localStorage.getItem("token");

  // ✅ Fetch contact details using Axios
  useEffect(() => {
    if (id) {
      axios.get(`${API_BASE}/get_contact_details.php?id=${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      })
        .then((res) => {
          if (res.data.success) setContact(res.data.contact);
        })
        .catch((err) => console.error("Error fetching contact details:", err));
    }
  }, [id, token]);

  // ✅ Fetch comments for this contact using Axios
  useEffect(() => {
    if (id) {
      axios.get(`${API_BASE}/get_contact_comments.php?contact_id=${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      })
        .then((res) => {
          if (res.data.success) setComments(res.data.comments || []);
        })
        .catch((err) => console.error("Error fetching contact comments:", err));
    }
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit new comment using Axios
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    setLoading(true);
    try {
      // ✅ Axios POST with Authorization Header
      const res = await axios.post(`${API_BASE}/add_contact_comment.php`, {
        contact_id: id,
        status: formData.status,
        comment: formData.newComment,
      }, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "" 
        },
      });

      const data = res.data;

      if (data.success) {
        setComments((prev) => [
          ...prev,
          {
            status: formData.status,
            comment: formData.newComment,
            created_at: new Date().toLocaleString(),
          },
        ]);

        setFormData({
          status: "Pending",
          newComment: "",
        });
      } else {
        alert("Failed to add comment");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Network error";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter comments by search term
  const filteredComments = useMemo(() => {
    return comments.filter(
      (c) =>
        c.comment?.toLowerCase().includes(search.toLowerCase()) ||
        c.status?.toLowerCase().includes(search.toLowerCase())
    );
  }, [comments, search]);

  const totalPages = Math.ceil(filteredComments.length / rowsPerPage);
  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredComments.slice(start, start + rowsPerPage);
  }, [filteredComments, currentPage, rowsPerPage]);

  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  if (!contact) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading contact details...
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Contact Request Comments
        </h2>
        <button
          onClick={() => navigate("/admin/contact-list")}
          className="px-3 py-1 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition"
        >
          Contact Requests List
        </button>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-6 mb-4 text-sm text-gray-600">
        <p>
          <strong>Name:</strong> {contact.name}
        </p>
        <p>
          <strong>Phone:</strong> {contact.phone}
        </p>
        <p>
          <strong>Email:</strong> {contact.email || "-"}
        </p>
        <p>
          <strong>Current Status:</strong>{" "}
          <span className="text-orange-600 font-medium">
            {contact.status || "Pending"}
          </span>
        </p>
      </div>

      {/* Add Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="border border-orange-300 rounded-lg p-4 mb-6 bg-white shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              <option value="Pending">Pending</option>
              <option value="Follow-Up">Follow-Up</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              New Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              name="newComment"
              value={formData.newComment}
              onChange={handleChange}
              placeholder="Enter your comment"
              rows={3}
              className="w-full border border-orange-400 rounded px-3 py-2 resize-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Comments Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-gray-700">
            Contact Request Comments
          </h3>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-orange-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-orange-50 text-gray-700 border-b border-orange-200">
                <th className="px-3 py-2 text-left">S.No</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Comment</th>
                <th className="px-3 py-2 text-left">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedComments.length > 0 ? (
                paginatedComments.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-orange-50/40 transition"
                  >
                    <td className="px-3 py-2">
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </td>
                    <td className="px-3 py-2">{c.status}</td>
                    <td className="px-3 py-2">{c.comment}</td>
                    <td className="px-3 py-2">{c.created_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <label>Show</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsChange}
              className="border border-orange-300 rounded px-2 py-1"
            >
              {[5, 10, 20].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-orange-300 rounded hover:bg-orange-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 text-gray-700">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-orange-300 rounded hover:bg-orange-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactComments;