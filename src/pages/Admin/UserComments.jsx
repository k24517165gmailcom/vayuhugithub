import React, { useState, useEffect, useMemo } from "react";
import axios from "axios"; // ✅ Added Axios

// ✅ API base from environment variable
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const UserComments = ({ user, onBack, onStatusUpdate }) => {
  const [formData, setFormData] = useState({
    status: "Pending",
    followUpDate: "",
    followUpTime: "",
    newComment: "",
  });
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const [isDateValid, setIsDateValid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ✅ Retrieve Bearer Token
  const token = localStorage.getItem("token");

  // ✅ Fetch comments dynamically using Axios
  useEffect(() => {
    if (user?.id) {
      axios.get(`${API_BASE}/get_user_comments.php?user_id=${user.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })
      .then((response) => {
        const data = response.data;
        if (data.success) setComments(data.comments || []);
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
      });
    }
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "followUpDate") {
      const today = new Date();
      const selected = new Date(value);
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        setDateError("Follow-up date cannot be in the past");
        setIsDateValid(false);
      } else {
        setDateError("");
        setIsDateValid(true);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newComment) {
      alert("Please enter a comment");
      return;
    }

    if (formData.status === "Follow-Up") {
      if (!formData.followUpDate || !formData.followUpTime) {
        alert("Follow-Up Date and Time are required");
        return;
      }
      if (dateError) {
        alert(dateError);
        return;
      }
    }

    setLoading(true);
    try {
      // ✅ Using Axios POST with Authorization Header
      const response = await axios.post(`${API_BASE}/add_user_comment.php`, {
        user_id: user.id,
        status: formData.status,
        comment: formData.newComment,
        follow_up_date: formData.status === "Follow-Up" ? formData.followUpDate : null,
        follow_up_time: formData.status === "Follow-Up" ? formData.followUpTime : null,
      }, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        }
      });

      const data = response.data;

      if (data.success) {
        setComments((prev) => [
          ...prev,
          {
            status: formData.status,
            comment: formData.newComment,
            follow_up_date: formData.status === "Follow-Up" ? formData.followUpDate : "-",
            follow_up_time: formData.status === "Follow-Up" ? formData.followUpTime : "-",
            created_at: new Date().toLocaleString(),
          },
        ]);

        if (onStatusUpdate) onStatusUpdate();

        setFormData({
          status: "Pending",
          followUpDate: "",
          followUpTime: "",
          newComment: "",
        });
        setDateError("");
        setIsDateValid(false);
      } else {
        alert(data.message || "Failed to add comment");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Network error";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">User Comments</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition"
        >
          User List
        </button>
      </div>

      {/* User Info */}
      <div className="flex flex-wrap gap-6 mb-4 text-sm text-gray-600">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="border border-orange-300 rounded-lg p-4 mb-6 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) => {
                handleChange(e);
                if (e.target.value !== "Follow-Up") setIsDateValid(false);
              }}
              className="w-full border border-orange-400 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              <option value="Pending">Pending</option>
              <option value="Follow-Up">Follow-Up</option>
              <option value="OnGoing">OnGoing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {formData.status === "Follow-Up" && (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Follow-Up Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className={`w-full border ${dateError ? "border-red-500" : "border-orange-400"} rounded px-3 py-2`}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Follow-Up Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="followUpTime"
                  value={formData.followUpTime}
                  onChange={handleChange}
                  disabled={!isDateValid}
                  className="w-full border border-orange-400 rounded px-3 py-2 disabled:opacity-50"
                  min="08:00"
                  max="20:00"
                  required
                />
                {!isDateValid && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Select a valid date to enable time selection (8 AM – 8 PM)
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="md:col-span-2">
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || (!!dateError && formData.status === "Follow-Up")}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Comments Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-gray-700">User Comments</h3>
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
                <th className="px-3 py-2 text-left">Follow-Up Date</th>
                <th className="px-3 py-2 text-left">Follow-Up Time</th>
                <th className="px-3 py-2 text-left">Comment</th>
                <th className="px-3 py-2 text-left">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedComments.length > 0 ? (
                paginatedComments.map((c, i) => (
                  <tr key={i} className="border-b hover:bg-orange-50/40 transition">
                    <td className="px-3 py-2">{(currentPage - 1) * rowsPerPage + i + 1}</td>
                    <td className="px-3 py-2">{c.status}</td>
                    <td className="px-3 py-2">{c.follow_up_date || "-"}</td>
                    <td className="px-3 py-2">{c.follow_up_time || "-"}</td>
                    <td className="px-3 py-2">{c.comment}</td>
                    <td className="px-3 py-2">{c.created_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <label>Show</label>
            <select
              value={rowsPerPage}
              onChange={handleRowsChange}
              className="border border-orange-300 rounded px-2 py-1"
            >
              {[5, 10, 20].map((num) => (
                <option key={num} value={num}>{num}</option>
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

export default UserComments;