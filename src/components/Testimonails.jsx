import React from "react";
import { motion } from "framer-motion";
import { assets, testimonialsData } from "../assets/assets";

const Testimonials = () => {
    return (
        <motion.section
            id="Testimonials"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-b from-orange-50 to-white py-20 px-6 md:px-20 lg:px-32"
        >
            {/* Section Header */}
            <div className="text-center mb-16">
                <h6 className="uppercase text-orange-500 tracking-widest font-semibold">
                    Voices of Our Community
                </h6>
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-3">
                    What Our Members Say
                </h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    Hear from startups, creators, and professionals who found their ideal
                    workspace and community at Vayuhu.
                </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
                {testimonialsData.map((testimonial, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 flex flex-col items-center text-center border border-orange-100"
                    >
                        <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-orange-100"
                        />
                        <h3 className="text-lg font-semibold text-gray-800">
                            {testimonial.name}
                        </h3>
                        {testimonial.role && (
                            <p className="text-orange-500 text-sm mb-3">
                                {testimonial.role}
                            </p>
                        )}
                        <div className="flex justify-center gap-1 mb-4">
                            {Array.from({ length: testimonial.rating }, (_, i) => (
                                <img
                                    key={i}
                                    src={assets.star_icon}
                                    alt="star"
                                    className="w-4 h-4"
                                />
                            ))}
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            “{testimonial.text}”
                        </p>
                        <p className="text-sm text-gray-400 italic">
                            {testimonial.company ? `— ${testimonial.company}` : ""}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Ratings Summary */}
            <div className="text-center mt-16">
                <h3 className="text-2xl font-semibold text-gray-800">
                    4.9 ★ from 120+ members
                </h3>
                <p className="text-gray-500">
                    Trusted by startups, freelancers, and innovators across our spaces.
                </p>
            </div>
        </motion.section>
    );
};

export default Testimonials;
