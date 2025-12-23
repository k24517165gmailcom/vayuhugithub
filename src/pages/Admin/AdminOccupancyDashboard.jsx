import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { RefreshCcw, LayoutDashboard, CheckCircle, XCircle, MapPin } from "lucide-react";
import axios from "axios"; // ✅ Imported Axios

const API_BASE_URL = import.meta.env.VITE_API_URL;

const COLORS = {
  Available: "#22c55e", 
  Booked: "#ef4444",    
  Maintenance: "#f59e0b", 
};

const AdminOccupancyDashboard = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("All");

  // ✅ Retrieve Bearer Token for Authorization
  const token = localStorage.getItem("token");

  const fetchData = () => {
    setLoading(true);
    
    // ✅ Switched to Axios with Authorization Header
    axios.get(`${API_BASE_URL}/get_spaces.php`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      }
    })
      .then((res) => {
        const data = res.data; // Axios stores response in .data
        if (data.success) {
          setSpaces(data.spaces);
          setLastUpdated(new Date());
        }
      })
      .catch((err) => {
        console.error("Failed to load admin data", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]); // ✅ Added token to dependency array

  // 1. PIE CHART DATA
  const pieData = useMemo(() => {
    let available = 0;
    let booked = 0;

    spaces.forEach((s) => {
      const isFree = s.is_available == 1 || s.is_available === true;
      if (isFree) available++;
      else booked++;
    });

    return [
      { name: "Available", value: available },
      { name: "Booked", value: booked },
    ];
  }, [spaces]);

  // 2. BAR CHART DATA
  const barData = useMemo(() => {
    const map = {};
    spaces.forEach((s) => {
      const type = s.space;
      if (!map[type]) {
        map[type] = { name: type, Available: 0, Booked: 0 };
      }
      const isFree = s.is_available == 1 || s.is_available === true;
      if (isFree) map[type].Available += 1;
      else map[type].Booked += 1;
    });
    return Object.values(map);
  }, [spaces]);

  // 3. GROUP DATA FOR SEAT MAP
  const spacesByType = useMemo(() => {
    const grouped = {};
    spaces.forEach((s) => {
      if (!grouped[s.space]) grouped[s.space] = [];
      grouped[s.space].push(s);
    });
    return grouped;
  }, [spaces]);

  const totalSpaces = spaces.length;
  const totalBooked = pieData.find((d) => d.name === "Booked")?.value || 0;
  const occupancyRate = totalSpaces > 0 ? ((totalBooked / totalSpaces) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="text-orange-500" />
            Workspace Live Status
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time visual overview of workspace inventory
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-xs text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchData}
            className="p-2 bg-white border rounded-full hover:bg-gray-100 shadow-sm transition"
            title="Refresh Data"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin text-orange-500" : "text-gray-600"} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Capacity" 
          value={totalSpaces} 
          icon={<LayoutDashboard size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Currently Available" 
          value={pieData[0].value} 
          icon={<CheckCircle size={24} />} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          icon={<XCircle size={24} />} 
          color="bg-orange-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Type Breakdown</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Legend />
                <Bar dataKey="Available" stackId="a" fill={COLORS.Available} radius={[0, 0, 4, 4]} />
                <Bar dataKey="Booked" stackId="a" fill={COLORS.Booked} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Overall Occupancy</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Available" ? COLORS.Available : COLORS.Booked} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan x="50%" dy="-10" fontSize="24" fontWeight="bold" fill="#374151">
                    {totalBooked}
                  </tspan>
                  <tspan x="50%" dy="20" fontSize="14" fill="#9ca3af">
                    Booked
                  </tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* --- VISUAL SEAT MAP: TABBED VIEW --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="text-indigo-500" /> Floor Status
            </h2>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveTab("All")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all border
                        ${activeTab === "All" 
                            ? "bg-gray-800 text-white border-gray-800" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                >
                    All Areas
                </button>
                {Object.keys(spacesByType).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all border
                            ${activeTab === type 
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

        {/* Dynamic Content Area */}
        <motion.div 
            layout 
            className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3"
        >
            {(activeTab === "All" ? spaces : spacesByType[activeTab] || []).map((space) => {
                const isAvailable = space.is_available == 1 || space.is_available === true;
                const displayCode = space.space_code || space.id || "#";
                const type = space.space;

                return (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={space.id} 
                        className={`
                            relative group p-2 rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center min-h-[70px]
                            ${isAvailable 
                                ? "border-green-200 bg-green-50/50 hover:bg-green-100" 
                                : "border-red-200 bg-red-50/50 hover:bg-red-100"}
                        `}
                    >
                         {/* Badge for Type */}
                        {activeTab === "All" && (
                            <span className="text-[9px] text-gray-400 font-medium mb-1 truncate w-full text-center">
                                {type}
                            </span>
                        )}

                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-sm ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className="text-[10px] font-bold">{displayCode}</span>
                        </div>
                        
                        <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-gray-900 text-white text-xs rounded p-2 z-20 text-center shadow-xl">
                            <p className="font-bold text-gray-300">{type}</p>
                            <p>Seat: {displayCode}</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
        
        {spaces.length === 0 && (
            <div className="text-center py-10 text-gray-400">No spaces found.</div>
        )}
      </div>
    </div>
  );
};

// Top Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between"
  >
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
      <h4 className="text-3xl font-bold text-gray-800 mt-1">{value}</h4>
    </div>
    <div className={`${color} text-white p-3 rounded-lg shadow-lg`}>
      {icon}
    </div>
  </motion.div>
);

export default AdminOccupancyDashboard;