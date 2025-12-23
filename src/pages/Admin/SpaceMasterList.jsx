import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Imported Axios
import EditSpaceMasterModal from "./EditSpaceMasterModal";

// ✅ Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const SpaceMasterList = () => {
  const [spaces, setSpaces] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  const statusColors = {
    Active: "text-green-600 bg-green-100",
    Inactive: "text-red-600 bg-red-100",
  };

  // Fetch spaces dynamically
  const fetchSpaces = async () => {
    try {
      // ✅ Switched to Axios with Authorization Header
      const response = await axios.get(`${API_BASE}/get_spaces.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = response.data; // Axios stores body in .data

      if (data.success) {
        setSpaces(data.spaces || []);
      } else {
        toast.error("Failed to load spaces");
      }
    } catch (error) {
      console.error("Error fetching spaces:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong while loading spaces";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  // Filter spaces by name or code
  const filteredSpaces = spaces.filter(
    (space) =>
      space.space.toLowerCase().includes(search.toLowerCase()) ||
      space.space_code.toLowerCase().includes(search.toLowerCase())
  );

  // Handle updating a space
  const handleUpdateSpace = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    formData.append("id", selectedSpace.id);

    try {
      // ✅ Switched to Axios POST with Bearer Token and multipart header
      const res = await axios.post(`${API_BASE}/update_space.php`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      const result = res.data;

      if (result.success) {
        toast.success("Updated successfully!");
        fetchSpaces(); // reload list
        setShowEditModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.message || "Network error!";
      toast.error(errorMsg);
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentSpaces = filteredSpaces.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSpaces.length / entriesPerPage);

  return (
    <div className="p-6 mt-10">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold">Space Master</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="mr-2">Show</span>
            <select
              className="border rounded px-2 py-1"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-1">entries</span>
          </div>
          <input
            type="text"
            className="border px-3 py-1 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by space or code"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-orange-50 text-left text-gray-700">
              <th className="py-2 px-4 border">S.No.</th>
              <th className="py-2 px-4 border">Image</th>
              <th className="py-2 px-4 border">Space Code</th>
              <th className="py-2 px-4 border">Space Name</th>
              <th className="py-2 px-4 border">Per Hour</th>
              <th className="py-2 px-4 border">Per Day</th>
              <th className="py-2 px-4 border">One Week</th>
              <th className="py-2 px-4 border">Two Weeks</th>
              <th className="py-2 px-4 border">Three Weeks</th>
              <th className="py-2 px-4 border">Per Month</th>
              <th className="py-2 px-4 border">Min Duration</th>
              <th className="py-2 px-4 border">Max Duration</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSpaces.length > 0 ? (
              currentSpaces.map((item, index) => (
                <tr key={item.id} className="text-center hover:bg-orange-50 transition">
                  <td className="py-2 px-4 border">{indexOfFirst + index + 1}</td>

                  {/* Image */}
                  <td className="py-2 px-4 border">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.space}
                        className="w-14 h-14 rounded object-cover cursor-pointer hover:scale-105 transition"
                        onClick={() => setPreviewImage(item.image_url)}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded bg-gray-200 text-gray-500 flex items-center justify-center">
                        N/A
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-4 border">{item.space_code}</td>
                  <td className="py-2 px-4 border">{item.space}</td>
                  <td className="py-2 px-4 border">{item.per_hour || "-"}</td>
                  <td className="py-2 px-4 border">{item.per_day || "-"}</td>
                  <td className="py-2 px-4 border">{item.one_week || "-"}</td>
                  <td className="py-2 px-4 border">{item.two_weeks || "-"}</td>
                  <td className="py-2 px-4 border">{item.three_weeks || "-"}</td>
                  <td className="py-2 px-4 border">{item.per_month || "-"}</td>
                  <td className="py-2 px-4 border">{item.min_duration_desc || "-"}</td>
                  <td className="py-2 px-4 border">{item.max_duration_desc || "-"}</td>

                  <td className="py-2 px-4 border">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        statusColors[item.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Edit Button */}
                  <td className="py-2 px-4 border">
                    <button
                      className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50"
                      onClick={() => {
                        setSelectedSpace(item);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="text-center py-4 text-gray-500">
                  No spaces found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-2">
        <p>
          Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredSpaces.length)} of{" "}
          {filteredSpaces.length} entries
        </p>

        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1 ? "bg-orange-500 text-white" : ""
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white text-gray-700 px-3 py-1 rounded-full"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditSpaceMasterModal
          space={selectedSpace}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateSpace}
        />
      )}
    </div>
  );
};

export default SpaceMasterList;