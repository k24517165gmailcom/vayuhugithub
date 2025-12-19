import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ import navigate

const Projects = () => {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const navigate = useNavigate();

  const workspaces = [
    {
      title: "Individual Working Space",
      desc: "Your private nook in the shared space.",
      image: "workspaces-1.jpg",
      plan: "Individual Working Space",
      features: ["High-speed WiFi", "Ergonomic Chair", "Power Backup", "Air Conditioning"],
    },
    {
      title: "Manager Cubicle",
      desc: "Leadership space, your way.",
      image: "workspaces2.jpg",
      plan: "Manager Cubicle",
      features: ["Private Desk", "Cabinet Storage", "WiFi", "Priority Support"],
    },
    {
      title: "Team Lead's Cubicle",
      desc: "Lead with focus, drive success.",
      image: "workspaces4.jpg",
      plan: "Team Leads Cubicle",
      features: ["Team Meeting Access", "Ergonomic Setup", "WiFi", "Quiet Zone"],
    },
    {
      title: "Executive Cabin",
      desc: "Elite space for strategic leadership.",
      image: "workspaces5.jpg",
      plan: "Executive Cabin",
      features: ["Premium Desk", "Private AC Zone", "Guest Access", "Dedicated Assistant"],
    },
    {
      title: "CEO's Cabin",
      desc: "Where visionaries lead and inspire.",
      image: "workspaces6.jpg",
      plan: "CEO Cabin",
      features: ["Luxury Setup", "Private Meeting Space", "24/7 Access", "Reception Service"],
    },
    {
      title: "Video Conferencing Room",
      desc: "Connect virtually, collaborate seamlessly.",
      image: "workspaces3.jpg",
      plan: "Video Conferencing",
      features: ["HD Video System", "Soundproof Walls", "Smart Board", "WiFi Access"],
    },
  ];

  const handleViewDetails = (plan) => {
    navigate("/workspace-pricing", { state: { plan } });
  };

  return (
    <motion.section
      id="WorkSpaces"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="container mx-auto px-6 md:px-20 lg:px-32 py-20"
    >
      <div className="text-center mb-12">
        <h6 className="uppercase text-orange-500 tracking-widest font-medium">
          What We Offer
        </h6>
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">
          Flexible Space to Work
        </h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
          Choose the perfect workspace designed for your focus, team meetings, or leadership goals — all within one dynamic community.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {workspaces.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
              <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-200 mb-4">{item.desc}</p>

              <button
                onClick={() => handleViewDetails(item.plan)}
                className="bg-white text-orange-600 hover:bg-orange-100 px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Projects;

