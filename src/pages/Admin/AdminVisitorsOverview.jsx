import React, { useEffect, useState } from "react";
import { X, Plus } from "lucide-react"; 
import axios from "axios"; // ✅ Imported Axios

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const AdminVisitorsOverview = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Get Auth Data from LocalStorage
  const token = localStorage.getItem("token");
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
  const CURRENT_ADMIN_ID = adminData.id || 3;

  // Form State
  const initialFormState = {
    name: "",
    contact: "",
    email: "",
    company_name: "",
    visiting_date: "",
    visiting_time: "",
    reason: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // -----------------------------
  // Fetch Visitors
  // -----------------------------
  const fetchVisitors = async () => {
    if(visitors.length === 0) setLoading(true);

    try {
      // ✅ Using Axios with Authorization Header
      const res = await axios.get(`${API_URL}/get_all_visitors.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });
      const data = res.data;

      if (!data.success) {
        setMessage(data.message || "Failed to load visitors");
        setLoading(false);
        return;
      }
      setVisitors(data.visitors);
    } catch (err) {
      console.error("Error fetching visitors:", err);
      const errorMsg = err.response?.data?.message || "Something went wrong while fetching visitors.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // -----------------------------
  // Form Handlers
  // -----------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        admin_id: CURRENT_ADMIN_ID, 
        user_id: null 
      };

      // ✅ Using Axios POST with Authorization Header
      const res = await axios.post(`${API_URL}/admin_add_visitor.php`, payload, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const result = res.data;

      if (result.success) {
        setIsModalOpen(false);
        setFormData(initialFormState);
        fetchVisitors(); 
        setMessage("Visitor added successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error adding visitor:", error);
      const errorMsg = error.response?.data?.message || "Failed to connect to server.";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  // -----------------------------
  // Render Helpers
  // -----------------------------
  const totalVisitors = visitors.length;
  
  // Simple unique user count
  const uniqueUsers = new Set(visitors.map(v => v.user_id).filter(id => id !== null)).size;
  
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : "-");
  const formatTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "-");

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-orange-600">Admin Visitors Overview</h1>
          <p className="text-sm text-gray-500">Manage all visitor entries</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-sm"
        >
          <Plus size={18} />
          Add Visitor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 flex flex-col justify-center">
          <h2 className="text-sm text-gray-500">Total Visitors</h2>
          <p className="text-2xl font-bold text-orange-600">{totalVisitors}</p>
        </div>
        <div className="bg-white shadow-sm border border-green-100 rounded-2xl p-4 flex flex-col justify-center">
          <h2 className="text-sm text-gray-500">Unique Users (Staff)</h2>
          <p className="text-2xl font-bold text-green-600">{uniqueUsers}</p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm text-center ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Visitors Table */}
      <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading visitor data...</p>
        ) : visitors.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No visitor records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-orange-50 text-gray-700 uppercase text-xs sticky top-0 z-10">
                <tr>
                  {["S.No", "Visitor Name", "Contact", "Email", "Company", "Date", "Time", "Reason", "Added By"].map((col) => (
                    <th key={col} className="p-3 border-b border-orange-100 font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr key={v.id} className="hover:bg-orange-50 transition duration-150 border-b border-gray-100">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium text-gray-800">{v.name}</td>
                    <td className="p-3 text-gray-600">{v.contact}</td>
                    <td className="p-3 text-gray-500">{v.email || "-"}</td>
                    <td className="p-3 text-gray-500">{v.company_name || "-"}</td>
                    <td className="p-3 text-gray-500">{formatDate(v.visiting_date)}</td>
                    <td className="p-3 text-gray-500">{formatTime(v.visiting_time)}</td>
                    <td className="p-3 text-gray-500">{v.reason || "-"}</td>
                    {/* If user_name is null, it means it was likely added by Admin */}
                    <td className="p-3 text-orange-600 font-medium">
                      {v.user_name ? v.user_name : <span className="text-purple-600 font-bold">Admin</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- POPUP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-orange-50">
              <h3 className="text-lg font-semibold text-gray-800">Add New Visitor (Admin)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Contact No *</label>
                  <input type="text" name="contact" required value={formData.contact} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="visiting_date" value={formData.visiting_date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" name="visiting_time" value={formData.visiting_time} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                <textarea name="reason" rows="2" value={formData.reason} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Visitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitorsOverview;