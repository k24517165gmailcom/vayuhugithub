import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const images = [
        { src: "workspaces-1.jpg", title: "Individual Working Space" },
        { src: "workspaces2.jpg", title: "Manager Cubicle" },
        { src: "workspaces4.jpg", title: "Team Lead's Cubicle" },
        { src: "workspaces5.jpg", title: "Executive Cabin" },
        { src: "workspaces6.jpg", title: "CEO Cabin" },
        { src: "workspaces3.jpg", title: "Video Conferencing Room" },
        { src: "workspace7.jpg", title: "Collaborative Lounge" },
        { src: "workspace8.jpg", title: "Open Desk Area" },
        { src: "workspace9.jpg", title: "Café & Refreshment Zone" },
    ];

    return (
        <motion.section
            id="Gallery"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-6 md:px-20 lg:px-32 py-20"
        >
            {/* Title */}
            <div className="text-center mb-12">
                <h6 className="uppercase text-orange-500 tracking-widest font-medium">
                    Explore Our Space
                </h6>
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">
                    Gallery
                </h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    A glimpse into our vibrant co-working environment — designed for focus,
                    collaboration, and creativity.
                </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {images.map((img, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 150 }}
                        className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer group"
                        onClick={() => setSelectedImage(img)}
                    >
                        <img
                            src={img.src}
                            alt={img.title}
                            className="w-full h-64 object-cover group-hover:brightness-75 transition"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 opacity-0 group-hover:opacity-100 transition">
                            <h3 className="text-lg font-semibold">{img.title}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="relative max-w-4xl w-[90%] rounded-2xl overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-orange-400 transition"
                            >
                                ✕
                            </button>
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.title}
                                className="w-full max-h-[80vh] object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center py-3 text-lg font-medium">
                                {selectedImage.title}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
};

export default Gallery;
