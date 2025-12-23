import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileText,
} from "lucide-react";
import axios from "axios"; // ✅ Imported Axios
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VirtualOfficeDetailsModal from "../../components/VirtualOfficeDetailsModal";

// ✅ Use environment variable
const API_URL = import.meta.env.VITE_API_URL;

const VirtualOfficeBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null); // New state for modal data
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  // ✅ Fetch Bookings Function
  const fetchBookings = async () => {
    setLoading(true);
    try {
      // ✅ Switched to Axios with Authorization Header
      const response = await axios.get(`${API_URL}/get_virtual_bookings.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = response.data; // Axios stores body in .data

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error("Failed to fetch bookings.");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.message || "Network error. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Function to handle "View" click
  const handleView = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  // ✅ Helper: Status Badge Color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            <CheckCircle size={12} /> Active
          </span>
        );
      case "expired":
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
            <XCircle size={12} /> Expired
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
            <Clock size={12} /> {status}
          </span>
        );
    }
  };

  // ✅ Filter Logic
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-orange-500" /> Virtual Office Bookings
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all virtual office subscriptions
          </p>
        </div>

        <div className="flex gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchBookings}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- Search & Stats --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or payment ID..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600 font-medium">
          Total Records:{" "}
          <span className="text-orange-600">{filteredBookings.length}</span>
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    <RefreshCw className="animate-spin inline-block mr-2" />{" "}
                    Loading data...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-10 text-gray-400 font-medium"
                  >
                    No bookings found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {booking.user_name || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {booking.user_email}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.start_date).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.end_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{parseFloat(booking.total_amount).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                          {booking.payment_id || "N/A"}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold mt-1 ${
                            booking.payment_status === "Paid"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {booking.payment_status || "Pending"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleView(booking)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-semibold border border-blue-200 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Place the Modal at the bottom of the JSX */}
      <VirtualOfficeDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default VirtualOfficeBookings;