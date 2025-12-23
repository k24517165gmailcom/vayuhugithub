import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios"; // ✅ Imported Axios

const Reservations = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const API_BASE =
          import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

        // ✅ Switched to Axios POST request
        const response = await axios.post(
          `${API_BASE}/get_workspace_bookings.php`,
          { user_id: userId }, // Axios handles JSON stringification automatically
          {
            headers: {
              "Content-Type": "application/json",
              // ✅ Added Bearer Token to headers
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = response.data; // Axios stores response in .data

        if (!data.success) {
          throw new Error(data.message || "Failed to load reservations.");
        }

        setBookings(data.bookings);
      } catch (err) {
        // Axios error handling looks into response.data.message
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, token]); // ✅ Added token to dependency array

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        All Reservations
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow text-sm">
        {loading && <p className="text-center p-4">Loading reservations...</p>}
        {error && <p className="text-center p-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Filters */}
            <div className="flex justify-between mb-4">
              <select className="border rounded-lg p-2 text-sm">
                <option>Show 10 entries</option>
                <option>Show 25 entries</option>
              </select>

              <input
                type="text"
                placeholder="Search..."
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Table */}
            <table className="w-full border-collapse text-sm">
              <thead className="bg-orange-100 text-gray-700">
                <tr>
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
                    <th key={col} className="p-2 border text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center p-4 text-gray-500">
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking, index) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{booking.workspace_title}</td>

                      <td className="p-2 border">
                        {booking.seat_codes ? (
                          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100 font-medium">
                            {booking.seat_codes}
                          </span>
                        ) : (
                          booking.space_code
                        )}
                      </td>

                      <td className="p-2 border">{booking.plan_type}</td>
                      <td className="p-2 border">
                        {booking.start_date} - {booking.end_date}
                      </td>
                      <td className="p-2 border">
                        {booking.start_time || "--"} -{" "}
                        {booking.end_time || "--"}
                      </td>
                      <td className="p-2 border">₹{booking.base_amount}</td>
                      <td className="p-2 border">₹{booking.discount_amount}</td>
                      <td className="p-2 border font-semibold">
                        ₹{booking.final_amount}
                      </td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between mt-4 text-gray-600">
              <p>
                Showing {bookings.length > 0 ? 1 : 0} to {bookings.length} of{" "}
                {bookings.length} entries
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

export default Reservations;