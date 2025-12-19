import React from "react";
import { motion } from "framer-motion";
import VirtualOfficeForm from "../components/VirtualOfficeForm";

const VirtualOfficeServices = () => {
    const sections = [
        {
            title: "Virtual Office for GST Registration",
            items: [
                "Register for GST.",
                "Can shift your GST-registered address to the provided address.",
                "Address as your mailing address.",
                "Courier receiving and courier forwarding facility.",
                "The address for website, visiting cards, webmail, etc.",
            ],
        },
        {
            title: "DOCUMENTS",
            items: [
                "KYC documents of all directors.",
                "PAN card of the company.",
                "Name approval certificate of the company.",
                "COI: Certificate of Incorporation (if the business entity is already registered).",
            ],
        },
        {
            title: "Business Registration",
            items: [
                "Can register for a new business entity.",
                "Use the address for opening a bank account.",
                "They can shift registered address to the provided address.",
                "Use the address for GST registration.",
                "GST verification at the venue (if GST registration is required).",
                "Use address for mailing address.",
                "Courier receiving and courier forwarding (courier charges applicable).",
                "Address can be used for website, visiting cards, webmail, etc.",
            ],
        },
        {
            title: "Virtual Office for Mailing Address",
            items: [
                "Address as your mailing address.",
                "Courier receiving and courier forwarding facility.",
                "Address on website, visiting cards, webmail, etc.",
            ],
        },
    ];

    const services = [
        {
            label: "Address Services",
            desc: "You receive a prestigious business address for official registrations.",
        },
        {
            label: "Meeting Rooms",
            desc: "Access to meeting spaces is often available on-demand for client meetings or presentations.",
        },
        {
            label: "Flexibility",
            desc: "You can work from anywhere while maintaining a professional image and support services, ideal for remote teams or businesses looking to expand without the overhead of physical space.",
        },
    ];

    return (
        <motion.section
            id="VirtualOfficeServices"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="container mx-auto px-6 md:px-20 lg:px-32 py-20"
        >
            {/* Header */}
            <div className="text-center mb-12">
                <h6 className="uppercase text-orange-500 tracking-widest font-medium">
                    Our Offerings
                </h6>
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">
                    Virtual Office & Business Registration
                </h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    Get a professional business address, manage GST registration, and receive mail handling services — all without the need for physical space.
                </p>
            </div>

            {/* Top Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {sections.map((sec, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl overflow-hidden"
                    >
                        <div className="bg-orange-500 text-white font-semibold text-lg px-5 py-3">
                            {sec.title}
                        </div>
                        <div className="bg-white p-6 space-y-2">
                            {sec.items.map((item, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                    <span className="text-orange-500 mt-1">✏️</span>
                                    <p className="text-gray-700 text-sm">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Services Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
                <div className="bg-orange-500 text-white font-semibold text-lg px-5 py-3">
                    SERVICES WE PROVIDE
                </div>
                <div className="bg-white p-8 space-y-6">
                    {services.map((srv, idx) => (
                        <div key={idx}>
                            <h4 className="font-semibold text-gray-800">{srv.label}</h4>
                            <p className="text-gray-600 text-sm mt-1">{srv.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
            {/* New Form Section */}
            <VirtualOfficeForm />
        </motion.section>

    );
};

export default VirtualOfficeServices;
