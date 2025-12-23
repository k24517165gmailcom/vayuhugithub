import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Map } from "lucide-react";
import axios from "axios"; // ✅ Imported Axios

const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminBlueprintView = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get Bearer Token from localStorage
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
        console.error("Error fetching blueprint data:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group spaces into "Zones" based on type
  const zones = useMemo(() => {
    const groups = {};
    spaces.forEach((s) => {
      const type = s.space;
      if (!groups[type]) groups[type] = [];
      groups[type].push(s);
    });
    return groups;
  }, [spaces]);

  const zoneKeys = Object.keys(zones).sort();

  return (
    <div className="min-h-screen bg-[#0c0a09] p-8 font-mono text-orange-100 relative overflow-hidden">
      {/* Background Grid Pattern (Blueprint Effect) - Orange Tint */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Header Panel */}
      <div className="relative z-10 flex justify-between items-end mb-10 border-b-2 border-orange-900/60 pb-4">
        <div>
          <h2 className="text-xs uppercase tracking-[0.3em] text-orange-500/80 mb-1">Architectural Layout</h2>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Map className="text-orange-500" />
            FLOOR PLAN LEVEL 01
          </h1>
        </div>
        
        <div className="flex gap-4 items-center">
            {/* Legend */}
            <div className="flex gap-6 mr-8 text-xs border-r border-orange-900/60 pr-8">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-dashed border-orange-500/50"></div>
                    <span className="opacity-70 text-orange-200">VACANT</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-600 border border-orange-400 relative">
                        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)'}}></div>
                    </div>
                    <span className="opacity-70 text-orange-200">OCCUPIED</span>
                </div>
            </div>

            <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 border border-orange-600 hover:bg-orange-900/30 text-orange-400 transition uppercase text-xs tracking-wider"
            >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                SYNC DATA
            </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {zoneKeys.map((zoneName, index) => {
            const items = zones[zoneName];
            const total = items.length;
            const available = items.filter(i => i.is_available == 1 || i.is_available === true).length;
            const occupied = total - available;

            return (
                <BlueprintZone 
                    key={zoneName} 
                    title={zoneName} 
                    items={items} 
                    stats={{total, available, occupied}}
                    index={index}
                />
            );
        })}
      </div>

      {/* Footer Label */}
      <div className="absolute bottom-4 right-6 text-orange-900 text-[10px] tracking-widest pointer-events-none select-none">
        DWG NO. 2024-ADMIN-VIEW • SCALE 1:100 • VAYUHU WORKSPACES
      </div>
    </div>
  );
};

const BlueprintZone = ({ title, items, stats, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="border-2 border-orange-900/50 bg-orange-950/20 p-1 relative"
        >
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-orange-500"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-orange-500"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-orange-500"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-orange-500"></div>

            <div className="bg-[#1c1917]/80 p-5 h-full backdrop-blur-sm">
                <div className="flex justify-between items-start mb-6 border-b border-orange-800/30 pb-2">
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h3>
                        <p className="text-[10px] text-orange-500/80 mt-1">ZONE {String(index + 1).padStart(2, '0')}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-white">{stats.available}/{stats.total}</div>
                        <div className="text-[10px] text-orange-500 uppercase">Avail / Total</div>
                    </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {items.map((seat) => {
                        const isFree = seat.is_available == 1 || seat.is_available === true;
                        return (
                            <div key={seat.id} className="group relative">
                                <div 
                                    className={`
                                        aspect-square flex items-center justify-center relative
                                        border transition-all duration-300
                                        ${isFree 
                                            ? "border-dashed border-orange-500/30 hover:border-orange-400 hover:bg-orange-500/10" 
                                            : "border-solid border-white bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                                        }
                                    `}
                                >
                                    <div className={`w-3/4 h-3/4 border-t-2 ${isFree ? 'border-orange-500/30' : 'border-white'} rounded-t-full`}></div>
                                    
                                    {!isFree && (
                                        <div className="absolute inset-0 opacity-20" 
                                             style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)'}}>
                                        </div>
                                    )}

                                    <span className={`
                                        absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-tighter bg-[#0c0a09] px-1 z-10
                                        ${isFree ? 'text-orange-500' : 'text-white'}
                                    `}>
                                        {seat.space_code}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminBlueprintView;