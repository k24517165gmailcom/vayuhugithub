import React, { useEffect, useState } from "react";
import axios from "axios"; // ✅ Imported Axios

const VirtualOfficeEnquiries = () => {
  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

  const [enquiries, setEnquiries] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  // -------------------------------
  // Fetch Enquiries
  // -------------------------------
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      // ✅ Switched to Axios with Authorization Header
      const response = await axios.get(`${API_BASE}/get_virtual_office_enquiries.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true,
      });

      const data = response.data; // Axios stores response body in .data
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [API_BASE]);

  // -------------------------------
  // Update Status
  // -------------------------------
  const updateStatus = async (id, status) => {
    try {
      // ✅ Switched to Axios POST with Authorization Header
      const response = await axios.post(
        `${API_BASE}/get_virtual_office_enquiries.php`,
        { id, status },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          withCredentials: true,
        }
      );

      const result = response.data;

      if (result.status === "success") {
        fetchEnquiries();
      } else {
        alert(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      const errorMsg = error.response?.data?.message || "Network error. Please try again.";
      alert(errorMsg);
    }
  };

  // -------------------------------
  // Filters
  // -------------------------------
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesStatus = filter === "All" || item.status === filter;
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone?.includes(searchTerm) ||
      item.referral_source
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="p-4 sm:p-8 bg-white rounded-lg shadow-sm border-t">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-orange-600">
          Virtual Office Enquiries
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["All", "Pending", "Follow-Up", "Ongoing", "Closed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 border rounded text-sm transition ${
              filter === status
                ? "bg-orange-500 text-white border-orange-500"
                : "border-orange-400 text-orange-500 hover:bg-orange-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-700 border-b">
              <th className="py-2 px-3">S.No.</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Phone</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Referral Source</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  Loading enquiries...
                </td>
              </tr>
            ) : filteredEnquiries.length > 0 ? (
              filteredEnquiries.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-orange-50 transition"
                >
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3 font-medium text-orange-700">
                    {item.name || "-"}
                  </td>
                  <td className="py-2 px-3">{item.phone || "-"}</td>
                  <td className="py-2 px-3">{item.email || "-"}</td>
                  <td className="py-2 px-3">
                    {item.referral_source || "-"}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {item.created_at || "-"}
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatus(item.id, e.target.value)
                      }
                      className="border border-orange-400 rounded px-2 py-1 text-sm focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Follow-Up">Follow-Up</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-600">
        Showing <b>{filteredEnquiries.length}</b> of{" "}
        <b>{enquiries.length}</b> entries
      </div>
    </div>
  );
};

export default VirtualOfficeEnquiries;