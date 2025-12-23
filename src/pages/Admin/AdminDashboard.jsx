import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Imported Axios
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [revenue, setRevenue] = useState({ categories: [], data: [] });

  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  // -----------------------------
  // Fetch Reservations
  // -----------------------------
  const fetchReservations = async () => {
    try {
      setLoadingReservations(true);
      // ✅ Switched to Axios with Authorization Header
      const res = await axios.get(`${API_URL}/get_reservations.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      const data = res.data;
      if (data.success) {
        setReservations(data.reservations || []);
      } else {
        toast.error(data.message || "Failed to load reservations");
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      const errorMsg = err.response?.data?.message || "Something went wrong while fetching reservations!";
      toast.error(errorMsg);
    } finally {
      setLoadingReservations(false);
    }
  };

  // -----------------------------
  // Fetch Revenue
  // -----------------------------
  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);
      // ✅ Switched to Axios with Authorization Header
      const res = await axios.get(`${API_URL}/get_monthly_revenue.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      const data = res.data;
      if (data.success) {
        const categories = data.revenue.map((r) => r.month);
        const seriesData = data.revenue.map((r) => Number(r.total_revenue));
        setRevenue({ categories, data: seriesData });
      }
    } catch (err) {
      console.error("Error fetching revenue:", err);
      toast.error("Failed to load revenue data");
    } finally {
      setLoadingRevenue(false);
    }
  };

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    fetchReservations();
    fetchRevenue();
  }, []);

  // -----------------------------
  // Summary Cards (Dynamic)
  // -----------------------------
  const newReservations = reservations.filter(
    (r) => new Date(r.booked_on) >= new Date(new Date().setDate(new Date().getDate() - 7))
  ).length;
  const ongoingReservations = reservations.length;
  const completedReservations = reservations.filter(
    (r) => new Date(r.date) < new Date()
  ).length;

  const stats = [
    { label: "New Reservations", value: newReservations },
    { label: "Ongoing Reservations", value: ongoingReservations },
    { label: "Completed Reservations", value: completedReservations },
    { label: "Today's Contact Request", value: 0 },
  ];

  // -----------------------------
  // Helpers
  // -----------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  };

  const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-orange-600">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Vayuhu: Elevate Your Workday, Where Collaboration Meets Innovation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 flex flex-col justify-center hover:shadow-md transition"
          >
            <h2 className="text-sm text-gray-500">{stat.label}</h2>
            <p className="text-2xl font-bold text-orange-600">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 mb-8">
        <h2 className="text-lg font-semibold mb-2 text-center text-orange-600">
          Monthly Revenue
        </h2>
        {loadingRevenue ? (
          <p className="text-center py-8 text-gray-500">Loading revenue data...</p>
        ) : (
          <Chart
            options={{
              chart: {
                id: "monthly-revenue",
                toolbar: {
                  show: true,
                  tools: { download: true, zoom: true, reset: true },
                },
                animations: {
                  enabled: true,
                  easing: "easeout",
                  speed: 800,
                  animateGradually: { enabled: true, delay: 150 },
                  dynamicAnimation: { enabled: true, speed: 350 },
                },
              },
              xaxis: {
                categories: revenue.categories,
                title: { text: "Month" },
                labels: { rotate: -45, style: { fontSize: "12px", fontWeight: 500 } },
                axisBorder: { show: true, color: "#e0e0e0" },
                axisTicks: { show: true, color: "#e0e0e0" },
              },
              yaxis: {
                title: { text: "Revenue (₹)" },
                labels: { formatter: (val) => `₹${val.toLocaleString()}` },
              },
              plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
              fill: {
                type: "gradient",
                gradient: {
                  shade: "light",
                  type: "vertical",
                  gradientToColors: ["#f59e0b"],
                  opacityFrom: 0.9,
                  opacityTo: 0.8,
                  stops: [0, 100],
                },
              },
              colors: ["#f97316"],
              dataLabels: { enabled: false },
              tooltip: { y: { formatter: (val) => `₹${val.toLocaleString()}` } },
              grid: { borderColor: "#f0f0f0", row: { colors: ["#f9f9f9", "transparent"], opacity: 0.5 } },
              states: { hover: { filter: { type: "lighten", value: 0.15 } } },
            }}
            series={[{ name: "Revenue", data: revenue.data || [] }]}
            type="bar"
            height={380}
          />
        )}
      </div>

      {/* Reservations Table */}
      <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-orange-600">
          Reservations
        </h2>
        {loadingReservations ? (
          <p className="text-center py-8 text-gray-500">Loading reservations...</p>
        ) : reservations.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No reservations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-orange-50 text-gray-700 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="p-2 border">S.No</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Mobile No</th>
                  <th className="p-2 border">Space</th>
                  <th className="p-2 border">Space Code</th>
                  <th className="p-2 border">Pack</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Timings</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Discount</th>
                  <th className="p-2 border">Final Total</th>
                  <th className="p-2 border">Booked On</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r, i) => (
                  <tr key={r.id} className="hover:bg-orange-50 transition duration-150">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{r.name}</td>
                    <td className="p-2 border">{r.mobile_no}</td>
                    <td className="p-2 border">{r.space}</td>
                    <td className="p-2 border">{r.space_code}</td>
                    <td className="p-2 border">{r.pack}</td>
                    <td className="p-2 border">{formatDate(r.date)}</td>
                    <td className="p-2 border">{r.timings}</td>
                    <td className="p-2 border">{formatCurrency(r.amount)}</td>
                    <td className="p-2 border">{formatCurrency(r.discount)}</td>
                    <td className="p-2 border font-medium text-orange-600">{formatCurrency(r.final_total)}</td>
                    <td className="p-2 border">{formatDate(r.booked_on)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;