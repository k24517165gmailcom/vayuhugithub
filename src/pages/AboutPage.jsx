import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import { Target, Eye, Heart, Building, Users, Handshake, MapPin } from "lucide-react";

const AboutPage = () => {
    return (
        <motion.section
            id="AboutPage"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-6 md:px-20 lg:px-32 py-20"
        >
            {/* ===== Header Section ===== */}
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
                    About <span className="text-orange-500">Vayuhu</span>
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto">
                    Redefining the modern workspace with flexibility, creativity, and community.
                </p>
            </div>

            {/* ===== Highlights Section (Animated + Lucide Icons) ===== */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center mb-20"
            >
                {[
                    { number: "20+", label: "Amenities", icon: Building },
                    { number: "145+", label: "Companies Working", icon: Users },
                    { number: "100%", label: "Community Focused", icon: Handshake },
                    { number: "Bengaluru", label: "Our Prime Location", icon: MapPin },
                ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{
                                delay: index * 0.2,
                                duration: 0.6,
                                type: "spring",
                            }}
                            whileHover={{
                                scale: 1.08,
                                rotate: [0, 2, -2, 0],
                                transition: { duration: 0.4 },
                            }}
                            className="flex flex-col items-center justify-center bg-white shadow-md rounded-2xl py-8 hover:shadow-xl border border-gray-100"
                        >
                            {/* Animated Icon */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: index * 0.3,
                                }}
                                className="mb-3"
                            >
                                <Icon className="w-12 h-12 text-orange-500" />
                            </motion.div>

                            {/* Number + Label */}
                            <h2 className="text-4xl font-bold text-orange-500">{item.number}</h2>
                            <p className="text-gray-600 mt-2 font-medium">{item.label}</p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ===== Who We Are Section ===== */}
            <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                {/* Animated Image Card */}
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    viewport={{ once: true }}
                    className="relative w-full md:w-1/2 overflow-hidden rounded-2xl shadow-lg group"
                >
                    {/* Image with subtle zoom on hover */}
                    <motion.img
                        src={assets.aboutImg}
                        alt="About Vayuhu"
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                    {/* Overlay text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="absolute bottom-5 left-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    >
                        <h3 className="text-xl font-bold">Calm. Creative. Connected.</h3>
                        <p className="text-sm text-gray-200">Discover spaces designed for focus and flow.</p>
                    </motion.div>
                </motion.div>

                {/* Text Section */}
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Who We Are</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Fueled by our passion for creating innovative workspace solutions — calm, quiet, and peaceful.
                        That’s the best kind of place to co-work.
                    </p>
                    <p className="text-gray-600 leading-relaxed mt-4">
                        Welcome to <span className="font-semibold text-orange-500">Vayuhu</span>, where work meets
                        community in the heart of Bengaluru. We offer a vibrant and collaborative environment designed
                        to inspire innovation and productivity. Our flexible workspaces cater to freelancers, startups,
                        and established businesses, providing the perfect setting to grow and succeed.
                    </p>
                </div>
            </div>


            {/* ===== Mission, Vision, and Values Section ===== */}
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Statements</h2>
                <p className="text-gray-500">Company Wants to Achieve</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
                {/* Mission */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-orange-500 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="flex justify-center mb-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Target className="w-12 h-12 text-orange-500" />
                        </motion.div>
                    </motion.div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        Our Effective <span className="text-orange-500">Mission</span> Statements
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        At <span className="font-semibold text-orange-500">Vayuhu</span>, our mission is to redefine the
                        modern work experience by fostering a dynamic and inclusive environment where entrepreneurs,
                        freelancers, and professionals can thrive. We are committed to providing flexible, high-quality
                        workspaces that inspire creativity, drive innovation, and support growth.
                    </p>
                </motion.div>

                {/* Vision */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-orange-500 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.6, type: "spring", delay: 0.1 }}
                        className="flex justify-center mb-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        >
                            <Eye className="w-12 h-12 text-orange-500" />
                        </motion.div>
                    </motion.div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        Our Inspiring <span className="text-orange-500">Vision</span> Statements
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        At <span className="font-semibold text-orange-500">Vayuhu</span>, our vision is to redefine the
                        future of work by creating inclusive environments where creativity, collaboration, and innovation
                        thrive. We aim to empower individuals and businesses to transform their work experience into one
                        of growth, connection, and success.
                    </p>
                </motion.div>

                {/* Values */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-white shadow-lg rounded-2xl p-8 border-t-4 border-orange-500 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
                        className="flex justify-center mb-4"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        >
                            <Heart className="w-12 h-12 text-orange-500" />
                        </motion.div>
                    </motion.div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        Impactful <span className="text-orange-500">Company</span> Values
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        At <span className="font-semibold text-orange-500">Vayuhu</span>, our values drive everything we
                        do. We encourage collaboration, creativity, and sustainability while ensuring integrity and
                        flexibility. We empower our members to grow, connect, and make a meaningful impact.
                    </p>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default AboutPage;
