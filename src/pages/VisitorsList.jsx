import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // ✅ Imported Axios

const VisitorsDetails = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

  useEffect(() => {
    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    const fetchVisitors = async () => {
      try {
        // ✅ Switched to Axios POST request
        const response = await axios.post(`${API_BASE}/get_visitors.php`, 
          { user_id: userId }, // Axios handles JSON stringification automatically
          {
            headers: { 
              "Content-Type": "application/json",
              // ✅ Added Bearer Token to headers
              Authorization: token ? `Bearer ${token}` : "" 
            },
          }
        );

        const data = response.data; // Axios stores response in .data

        if (!data.success) {
          throw new Error(data.message || "Failed to load visitors.");
        }

        setVisitors(data.visitors);
        setFilteredVisitors(data.visitors);
      } catch (err) {
        console.error(err);
        // Axios error handling looks into response.data.message
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, [userId, token]); // ✅ Added token to dependency array

  // ✅ Search functionality
  useEffect(() => {
    const filtered = visitors.filter((v) =>
      [v.name, v.contact, v.email, v.company_name, v.reason]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredVisitors(filtered);
  }, [searchTerm, visitors]);

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Visitors Details
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow text-sm">
        {loading && <p className="text-center p-4">Loading visitors...</p>}
        {error && <p className="text-center p-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Search + Entries Filter */}
            <div className="flex justify-between mb-4">
              <select className="border rounded-lg p-2 text-sm">
                <option>Show 10 entries</option>
                <option>Show 25 entries</option>
                <option>Show 50 entries</option>
              </select>

              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Visitors Table */}
            <table className="w-full border-collapse text-sm">
              <thead className="bg-orange-100 text-gray-700">
                <tr>
                  {[
                    "S.No.",
                    "Name",
                    "Contact No",
                    "Email",
                    "Company Name",
                    "Visiting Date",
                    "Visiting Time",
                    "Reason",
                    "Added On",
                  ].map((col) => (
                    <th key={col} className="p-2 border text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center p-4 text-gray-500"
                    >
                      No visitors found
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor, index) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{visitor.name}</td>
                      <td className="p-2 border">{visitor.contact}</td>
                      <td className="p-2 border">{visitor.email || "—"}</td>
                      <td className="p-2 border">{visitor.company_name}</td>
                      <td className="p-2 border">
                        {visitor.visiting_date || "—"}
                      </td>
                      <td className="p-2 border">
                        {visitor.visiting_time
                          ? visitor.visiting_time.slice(0, 5)
                          : "—"}
                      </td>
                      <td className="p-2 border">{visitor.reason || "—"}</td>
                      <td className="p-2 border text-gray-500">
                        {new Date(visitor.added_on).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between mt-4 text-gray-600">
              <p>
                Showing {filteredVisitors.length > 0 ? 1 : 0} to{" "}
                {filteredVisitors.length} of {filteredVisitors.length} entries
              </p>

              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded-lg hover:bg-orange-100">
                  Previous
                </button>
                <button className="px-3 py-1 border rounded-lg hover:bg-orange-100">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default VisitorsDetails;