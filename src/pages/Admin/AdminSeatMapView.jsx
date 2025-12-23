import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, User } from "lucide-react";
import axios from "axios"; // ✅ Imported Axios

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminSeatMapView = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  const fetchData = () => {
    setLoading(true);

    // ✅ Using Axios with Authorization Header
    axios.get(`${API_BASE_URL}/get_spaces.php`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      }
    })
      .then((res) => {
        // Axios wraps response in 'data'
        const data = res.data;
        if (data.success) {
          setSpaces(data.spaces);
        }
      })
      .catch((err) => {
        console.error("Error fetching seat map data:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group spaces by their Category (e.g., "Hot Desk", "Private Cabin")
  const groupedSpaces = useMemo(() => {
    const groups = {};
    spaces.forEach((s) => {
      if (!groups[s.space]) {
        groups[s.space] = [];
      }
      groups[s.space].push(s);
    });
    return groups;
  }, [spaces]);

  // Sort groups so "Hot Desk" might appear first, etc.
  const sortedGroupKeys = Object.keys(groupedSpaces).sort();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Workspace Floor Map</h1>
          <p className="text-gray-500 text-sm">Live visual inventory of all seats</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-fit">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-100 border border-green-400 rounded"></div>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-100 border border-red-400 rounded relative">
             <div className="absolute inset-0 flex items-center justify-center text-red-500 text-[10px]">●</div>
          </div>
          <span className="text-sm text-gray-600">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded opacity-50"></div>
          <span className="text-sm text-gray-600">Maintenance</span>
        </div>
      </div>

      {/* The Visual Grid */}
      <div className="space-y-8">
        {loading ? (
          <p className="text-gray-400">Loading map...</p>
        ) : (
          sortedGroupKeys.map((category) => {
            const items = groupedSpaces[category];
            const total = items.length;
            const available = items.filter(i => i.is_available == 1 || i.is_available === true).length;
            const occupied = total - available;

            return (
              <motion.div 
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
              >
                {/* Category Header */}
                <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-2">
                  <h3 className="text-lg font-bold text-gray-800">{category}</h3>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">{available} Free</span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span className="text-red-500 font-medium">{occupied} Busy</span>
                  </div>
                </div>

                {/* The "Seats" Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                  {items.map((seat) => {
                     const isFree = seat.is_available == 1 || seat.is_available === true;
                     
                     return (
                       <div 
                         key={seat.id} 
                         className="relative group"
                       >
                         {/* The Seat Box */}
                         <div 
                           className={`
                             h-12 w-full rounded-md border flex items-center justify-center transition-all cursor-default
                             ${isFree 
                               ? "bg-green-50 border-green-200 text-green-700" 
                               : "bg-red-50 border-red-200 text-red-700"
                             }
                           `}
                         >
                           <span className="text-xs font-semibold">{seat.space_code || seat.id}</span>
                           {!isFree && (
                             <User size={12} className="absolute top-1 right-1 opacity-50" />
                           )}
                         </div>

                         {/* Hover Tooltip */}
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                           {seat.space_code} - {isFree ? "Available" : "Booked"}
                         </div>
                       </div>
                     );
                  })}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminSeatMapView;