import React from "react";
import { motion } from "framer-motion";


const teamMembers = [
    {
        name: "Manoj Kumar P",
        role: "Software Developer",
        image: "https://randomuser.me/api/portraits/men/75.jpg",

    },
    {
        name: "Priya Sharma",
        role: "Operations Manager",
        image: "https://randomuser.me/api/portraits/women/68.jpg",

    },
    {
        name: "Ravi Patel",
        role: "UI/UX Designer",
        image: "https://randomuser.me/api/portraits/men/66.jpg",

    },
];

const Team = () => {
    return (
        <section id="Team" className="py-20 bg-gray-900 text-white">
            <div className="container mx-auto px-6 md:px-20 lg:px-32 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl font-bold mb-4"
                >
                    Meet Our <span className="text-orange-400">Team</span>
                </motion.h2>

                <p className="text-gray-400 max-w-2xl mx-auto mb-12">
                    A small, dedicated team building a big vision — crafting spaces and
                    digital experiences that help people connect, work, and grow.
                </p>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 justify-center">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-orange-500/20 transition-all"
                        >
                            <div className="w-40 h-40 mx-auto mb-5 overflow-hidden rounded-full border-4 border-orange-400">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-semibold">{member.name}</h3>
                            <p className="text-gray-400 mb-3">{member.role}</p>


                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
