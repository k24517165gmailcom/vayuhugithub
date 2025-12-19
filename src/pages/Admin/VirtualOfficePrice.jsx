import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import EditVirtualOfficePriceModal from "./EditVirtualOfficePriceModal";

// ✅ Vite environment variable
const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const VirtualOfficePrice = () => {
  const [priceList, setPriceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusColors = {
    Active: "text-green-600 bg-green-100",
    Inactive: "text-red-600 bg-red-100",
  };

  const fetchPrices = async () => {
    try {
      const response = await fetch(`${API_URL}/get_virtual_office_price_list.php`);
      const result = await response.json();
      if (result.status === "success") {
        setPriceList(result.data || []);
      } else {
        toast.error("No records found.");
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error("Error loading prices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleUpdate = async (updatedData) => {
    try {
      const response = await fetch(`${API_URL}/update_virtual_office_price.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Price updated successfully!");
        setShowModal(false);
        fetchPrices();
      } else {
        toast.error(result.message || "Update failed.");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      toast.error("Network error.");
    }
  };

  return (
    <div className="p-6 mt-10 flex justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Virtual Office Price List
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm bg-white">
            <thead>
              <tr className="bg-orange-50 text-gray-700">
                <th className="py-2 px-4 border">S.No.</th>
                <th className="py-2 px-4 border">Min Duration</th>
                <th className="py-2 px-4 border">Max Duration</th>
                <th className="py-2 px-4 border">Price</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : priceList.length > 0 ? (
                priceList.map((item, index) => (
                  <tr key={item.id} className="text-center hover:bg-orange-50 transition">
                    <td className="py-2 px-4 border">{index + 1}</td>
                    <td className="py-2 px-4 border">{item.min_duration}</td>
                    <td className="py-2 px-4 border">{item.max_duration}</td>
                    <td className="py-2 px-4 border">₹{item.price}</td>
                    <td className="py-2 px-4 border">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColors[item.status] || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border">
                      <button
                        className="border border-orange-500 text-orange-500 px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition text-sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedItem && (
        <EditVirtualOfficePriceModal
          data={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default VirtualOfficePrice;
