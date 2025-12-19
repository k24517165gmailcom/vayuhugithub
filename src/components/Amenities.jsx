import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Wifi, 
    BatteryCharging, 
    Coffee, 
    Home, 
    Wind, 
    Printer, 
    Users, 
    CalendarCheck 
} from 'lucide-react';

const amenitiesList = [
    { title: 'High-Speed Internet', desc: 'Reliable and fast internet connectivity.', icon: Wifi },
    { title: 'UPS Backup', desc: 'Ensure uninterrupted productivity with our reliable UPS backup system.', icon: BatteryCharging },
    { title: 'Tea/Coffee', desc: 'Loosen up and Recharge with complimentary tea & coffee.', icon: Coffee },
    { title: 'House Keeping', desc: 'Regular cleaning to maintain a hygienic environment.', icon: Home },
    { title: 'Air Conditioner', desc: 'Our coworking space is fully air-conditioned.', icon: Wind },
    { title: 'Scanner & Printer', desc: 'Easily access our high-quality scanner and printer services.', icon: Printer },
    { title: 'Dining Area Lounge', desc: 'Offers complimentary access, providing a welcoming space for guests.', icon: Users },
    { title: 'Meeting Room', desc: 'Available for booking at an additional cost, professional amenities for business gatherings.', icon: CalendarCheck },
];

const Amenities = () => {
    const carouselRef = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (carouselRef.current) {
            setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (carouselRef.current) {
                setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.section
            id="Amenities"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="container mx-auto py-20 px-6 md:px-20 lg:px-32"
        >
            {/* Section Heading */}
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl sm:text-5xl font-bold text-center mb-12"
            >
                Our <span className="text-orange-500">Amenities</span>
            </motion.h2>

            {/* Carousel for mobile, grid for tablet/desktop */}
            <motion.div
                ref={carouselRef}
                className="overflow-x-hidden md:overflow-x-visible cursor-grab"
                whileTap={{ cursor: "grabbing" }}
            >
                <motion.div
                    className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 min-w-max md:min-w-0"
                    drag="x"
                    dragConstraints={{ right: 0, left: -width }}
                    dragElastic={0.05}
                >
                    {amenitiesList.map(({ title, desc, icon: Icon }, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                            whileHover={{ scale: 1.05 }}
                            className="flex-shrink-0 w-64 md:w-auto relative group"
                        >
                            {/* Animated Gradient Border */}
                            <div className="absolute inset-0 rounded-2xl p-[2px] bg-[length:400%_400%] 
                                            bg-gradient-to-r from-orange-400 via-yellow-300 via-orange-500 to-orange-400
                                            animate-borderFlow opacity-0 group-hover:opacity-100 blur-[2px] transition-all duration-500"></div>

                            {/* Card Body */}
                            <div className="relative bg-gradient-to-br from-white to-orange-50 shadow-md hover:shadow-xl 
                                            rounded-2xl p-6 flex flex-col items-start gap-3 border border-orange-100 
                                            transition-all duration-300 backdrop-blur-sm overflow-hidden h-[260px]">
                                
                                {/* Floating Animated Icon */}
                                <motion.div
                                    animate={{ y: [0, -5, 0, 5, 0], rotate: [0, 2, 0, -2, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                                    className="flex items-center justify-center w-14 h-14 rounded-full 
                                               bg-gradient-to-br from-orange-100 to-yellow-100 
                                               shadow-inner shadow-orange-200"
                                >
                                    <Icon className="text-orange-500" size={26} />
                                </motion.div>

                                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Custom Keyframes for Border Animation */}
            <style>{`
                @keyframes borderFlow {
                    0% { background-position: 0% 50%; filter: brightness(1); opacity: 0.8; }
                    50% { background-position: 100% 50%; filter: brightness(1.3); opacity: 1; }
                    100% { background-position: 0% 50%; filter: brightness(1); opacity: 0.8; }
                }
                .animate-borderFlow {
                    animation: borderFlow 6s ease-in-out infinite;
                }
            `}</style>
        </motion.section>
    );
};

export default Amenities;
