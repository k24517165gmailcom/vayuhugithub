import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios"; // ✅ Imported Axios

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    upcoming: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  // ✅ Get the token for Authorization
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

        // ✅ Using Axios POST request
        const response = await axios.post(
          `${API_BASE}/get_booking_summary.php`,
          { user_id: userId }, // Axios sends this as JSON automatically
          {
            headers: {
              "Content-Type": "application/json",
              // ✅ Added Bearer Token to Axios headers
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = response.data; // Axios stores response in .data

        if (!data.success) {
          throw new Error(data.message || "Failed to load dashboard data.");
        }

        setBookings(data.bookings || []);
        setSummary(data.summary || {});
      } catch (err) {
        // Axios errors store the server message in err.response.data
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, token]);

  // 🧾 Today's reservations (frontend filter)
  const today = new Date().toISOString().split("T")[0];
  const todaysReservations = bookings.filter((b) => b.start_date === today);

  const renderTable = (data) => (
    <div className="bg-white rounded-2xl shadow p-4 mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-700">
              {[
                "S.No.",
                "Space",
                "Space Code",
                "Pack",
                "Date",
                "Timings",
                "Amount",
                "Discount",
                "Final Total",
                "Status",
              ].map((col) => (
                <th key={col} className="p-3 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  No data available in table
                </td>
              </tr>
            ) : (
              data.map((b, i) => (
                <tr key={b.booking_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{b.workspace_title}</td>
                  <td className="p-3">{b.space_code || "--"}</td>
                  <td className="p-3">{b.plan_type}</td>
                  <td className="p-3">
                    {b.start_date} - {b.end_date}
                  </td>
                  <td className="p-3">
                    {b.start_time || "--"} - {b.end_time || "--"}
                  </td>
                  <td className="p-3">₹{b.base_amount}</td>
                  <td className="p-3">₹{b.discount_amount}</td>
                  <td className="p-3 font-semibold">₹{b.final_amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        b.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : b.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Dashboard Overview
      </h1>

      {loading ? (
        <p className="text-center text-gray-500 p-6">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500 p-6">{error}</p>
      ) : (
        <>
          {/* 🔢 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Reservations", value: summary.total },
              { label: "Ongoing", value: summary.ongoing },
              { label: "Completed", value: summary.completed },
              { label: "Upcoming", value: summary.upcoming },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-all text-center sm:text-left"
              >
                <h2 className="text-lg font-medium text-gray-600">
                  {stat.label}
                </h2>
                <p className="text-3xl font-bold text-orange-500 mt-2">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* 🕓 Today’s Reservations */}
          <h2 className="text-xl font-semibold mt-10 text-gray-700">
            Today’s Reservations
          </h2>
          {renderTable(todaysReservations)}

          {/* 📅 All Reservations */}
          <h2 className="text-xl font-semibold mt-10 text-gray-700">
            All Reservations
          </h2>
          {renderTable(bookings)}
        </>
      )}
    </Layout>
  );
};

export default Dashboard;