import React from "react";
import { motion } from "framer-motion";

const CoworkingPromo = () => {
  return (
    <div className="w-full bg-white p-4 md:p-8">
      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-center text-gray-800"
      >
        BOOST PRODUCTIVITY IN OUR
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl italic text-center text-gray-700 mb-8"
      >
        Co-Working Spaces
      </motion.h2>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">

        {/* LEFT IMAGE – FULL SIZE ALWAYS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-[250px] object-cover"

        >
          <img
            src="/coworking-promo.jpeg"
            alt="Coworking Space"
            className="w-full h-auto object-cover rounded-xl"
          />
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-5 p-2"
        >
          {/* Feature List */}
          <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-4">
            <span className="text-2xl">👥</span>
            <p className="text-lg">Comfortable Workstation</p>
          </div>

          <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-4">
            <span className="text-2xl">📶</span>
            <p className="text-lg">High - Speed Internet</p>
          </div>

          <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-4">
            <span className="text-2xl">💻</span>
            <p className="text-lg">Power Back Up</p>
          </div>

          <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-4">
            <span className="text-2xl">☕</span>
            <p className="text-lg">Open Cafeteria</p>
          </div>

          {/* OFFER */}
          <div className="bg-yellow-400 text-black p-6 rounded-xl shadow-xl text-center">
            <h3 className="text-2xl font-bold">SPECIAL OFFER</h3>
            <p className="text-3xl font-bold mt-2">4,000 /-</p>
          </div>

          {/* ADDRESS */}
          <div className="mt-4 text-gray-700 text-lg">
            <p className="flex items-center gap-2">
              📍 #25, Kalpana Chawla Road, Bhoopasandra, Hebbal
            </p>
            <p className="flex items-center gap-2">🌐 www.vayuhu.com</p>
            <p className="flex items-center gap-2">☎️ 91 7348857574</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CoworkingPromo;
