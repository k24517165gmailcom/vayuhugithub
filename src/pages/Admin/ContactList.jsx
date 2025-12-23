import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Added Axios

const ContactList = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  // Fetch contact data
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // ✅ Switched to Axios with Authorization Header
        const response = await axios.get(`${API_BASE}/get_contacts.php`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        
        // Axios stores the response body in .data
        setContacts(response.data || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, [API_BASE, token]);

  // Filter by status
  const filteredContacts = contacts.filter((contact) => {
    const matchesStatus = filter === "All" || contact.status === filter;
    const matchesSearch =
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 bg-white rounded-lg shadow-sm border-t">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Contact Requests
        </h2>
        <button
          onClick={() => navigate("/admin/add-contact")}
          className="border border-orange-500 text-orange-500 px-4 py-2 rounded hover:bg-orange-50 transition text-sm sm:text-base"
        >
          + Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["All", "Pending", "Follow-Up", "Ongoing", "Closed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 border rounded text-sm sm:text-base transition ${
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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 text-sm">Show</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-gray-700 text-sm">entries</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-700 text-sm">Search:</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-700 border-b">
              <th className="py-2 px-3">S.No.</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Mobile No</th>
              <th className="py-2 px-3">Email ID</th>
              <th className="py-2 px-3">Date & Time</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Comments</th>
              <th className="py-2 px-3">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <tr
                  key={contact.id || index}
                  className="border-b hover:bg-orange-50 transition"
                >
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3 font-medium text-orange-700">
                    {contact.name || "-"}
                  </td>
                  <td className="py-2 px-3">{contact.phone || "-"}</td>
                  <td className="py-2 px-3">{contact.email || "-"}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {contact.date || "-"}
                  </td>
                  <td className="py-2 px-3">{contact.status || "Pending"}</td>
                  <td className="py-2 px-3">
                    <button
                      className="border border-orange-400 text-orange-500 px-3 py-1 rounded hover:bg-orange-50 text-sm"
                      onClick={() => navigate(`/admin/contact-comments/${contact.id}`)}

                    >
                      View
                    </button>
                  </td>
                  <td className="py-2 px-3">
                    <button
                      className="border border-orange-400 text-orange-500 px-3 py-1 rounded hover:bg-orange-50 text-sm"
                      onClick={() => navigate(`/admin/edit-contact/${contact.id}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <p>
          Showing <b>{filteredContacts.length}</b> of{" "}
          <b>{contacts.length}</b> entries
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded hover:bg-orange-50">
            Prev
          </button>
          <button className="px-3 py-1 border rounded hover:bg-orange-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactList;