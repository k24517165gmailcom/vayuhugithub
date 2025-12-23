import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios"; // ✅ Added Axios
import "react-toastify/dist/ReactToastify.css";
import UserProfileModal from "./UserProfileModal";
import UserComments from "./UserComments";
import CompanyProfileModal from "./CompanyProfileModal";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUser, setViewUser] = useState(null); // 👈 added for View modal
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedCommentUser, setSelectedCommentUser] = useState(null);

  // ✅ Retrieve token from localStorage
  const token = localStorage.getItem("token");

  const statusColors = {
    Pending: "text-yellow-600 bg-yellow-100",
    Ongoing: "text-blue-600 bg-blue-100",
    Followup: "text-purple-600 bg-purple-100",
    Closed: "text-green-600 bg-green-100",
  };

  // ✅ Fetch users using Axios with Bearer Token
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/get_users.php`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      // Axios automatically parses JSON into response.data
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Fetch error:", error);
      const errorMsg = error.response?.data?.message || "Failed to load users";
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // ✅ Handle save using Axios with Bearer Token
  const handleSaveUser = async (updatedData) => {
    try {
      const formData = new FormData();
      formData.append("id", selectedUser.id);
      formData.append("name", updatedData.name);
      formData.append("email", updatedData.email);
      formData.append("phone", updatedData.phone);
      formData.append("dob", updatedData.dob);
      formData.append("address", updatedData.address);
      formData.append("password", updatedData.password || "");
      if (updatedData.profilePic)
        formData.append("profilePic", updatedData.profilePic);

      const response = await axios.post(`${API_BASE}/update_user.php`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = response.data;
      if (data.success) {
        toast.success("User updated successfully!");
        fetchUsers();
        setSelectedUser(null);
      } else {
        toast.error(data.message || "Failed to update user.");
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMsg);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

  if (selectedCommentUser) {
    return (
      <UserComments
        user={selectedCommentUser}
        onBack={() => {
          setSelectedCommentUser(null);
          fetchUsers();
        }}
        onStatusUpdate={fetchUsers}
      />
    );
  }

  return (
    <div className="p-6 mt-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold">Users</h2>
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
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-1 rounded"
              placeholder="Search by name, email, or phone"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-orange-50 text-left text-gray-700">
              <th className="py-2 px-4 border">S.No.</th>
              <th className="py-2 px-4 border">Profile Pic</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Mobile No</th>
              <th className="py-2 px-4 border">Email ID</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Comments</th>
              <th className="py-2 px-4 border">User Details</th>
              <th className="py-2 px-4 border">Company</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr
                  key={user.id || index}
                  className="text-center hover:bg-orange-50 transition"
                >
                  <td className="py-2 px-4 border">
                    {indexOfFirst + index + 1}
                  </td>

                  <td className="py-2 px-4 border">
                    {user.profile_pic ? (
                      <img
                        src={user.profile_pic}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover mx-auto cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setPreviewImage(user.profile_pic)}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-gray-500">
                        N/A
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-4 border">{user.name}</td>
                  <td className="py-2 px-4 border">{user.phone}</td>
                  <td className="py-2 px-4 border">{user.email}</td>

                  <td className="py-2 px-4 border text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${
                        statusColors[user.status] || "text-gray-500 bg-gray-100"
                      }`}
                    >
                      {user.status || "Pending"}
                    </span>
                  </td>

                  <td className="py-2 px-4 border">
                    <button
                      className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50"
                      onClick={() => setSelectedCommentUser(user)}
                    >
                      View
                    </button>
                  </td>

                  <td className="py-2 px-4 border">
                    <button
                      className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50"
                      onClick={() => setSelectedUser(user)}
                    >
                      Edit
                    </button>
                  </td>

                  <td className="py-2 px-4 border">
                    <button
                      className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50"
                      onClick={() => setViewUser(user)} // 👈 open view modal
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-2">
        <p>
          Showing {indexOfFirst + 1} to{" "}
          {Math.min(indexOfLast, filteredUsers.length)} of{" "}
          {filteredUsers.length} entries
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {viewUser && (
        <CompanyProfileModal
          userId={viewUser.id} // pass only user ID
          onClose={() => setViewUser(null)}
        />
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative">
            <img
              src={previewImage}
              alt="Profile Preview"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg border border-white"
            />
            <button
              className="absolute top-2 right-2 bg-white text-gray-800 px-3 py-1 rounded-full hover:bg-gray-100"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;