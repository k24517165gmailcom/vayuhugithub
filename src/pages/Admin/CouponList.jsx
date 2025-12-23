import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Added Axios
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);

    // ✅ Get Bearer Token from localStorage
    const token = localStorage.getItem("token");

    try {
      // ✅ Using Axios with Authorization Header
      const res = await axios.get(`${API_URL}/get_coupons.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "", // ✅ Bearer Token added
        },
      });

      // ✅ Axios stores response in .data
      const data = res.data;

      if (data.success) {
        setCoupons(data.coupons);
      } else {
        toast.error(data?.message || "Failed to fetch coupons");
      }
    } catch (err) {
      // ✅ Improved error handling for Axios
      const errorMsg = err.response?.data?.message || err.message || "Error fetching coupons";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-orange-600">Coupon List</h1>
      <p className="text-gray-600 mb-6">View all active and expired coupons.</p>

      {loading ? (
        <p className="text-gray-500">Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <p className="text-gray-500">No coupons found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-orange-100 text-left">
                <th className="px-4 py-2 border-b">Coupon Code</th>
                <th className="px-4 py-2 border-b">Valid From</th>
                <th className="px-4 py-2 border-b">Valid To</th>
                <th className="px-4 py-2 border-b">User Type</th>
                <th className="px-4 py-2 border-b">Space Type</th>
                <th className="px-4 py-2 border-b">Discount (%)</th>
                <th className="px-4 py-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const today = new Date().toISOString().split("T")[0];
                const status = c.valid_to >= today ? "Active" : "Expired";

                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{c.coupon_code}</td>
                    <td className="px-4 py-2 border-b">{c.valid_from}</td>
                    <td className="px-4 py-2 border-b">{c.valid_to}</td>
                    <td className="px-4 py-2 border-b">{c.user_type}</td>
                    <td className="px-4 py-2 border-b">{c.space_type}</td>
                    <td className="px-4 py-2 border-b">{c.discount}</td>
                    <td className={`px-4 py-2 border-b font-semibold ${status === "Active" ? "text-green-600" : "text-red-600"}`}>
                      {status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CouponList;