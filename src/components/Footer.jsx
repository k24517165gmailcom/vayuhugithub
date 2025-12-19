import React from "react";
import { MapPin, Phone, Mail, Image } from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();

    const handleGalleryRedirect = () => {
        navigate("/gallery"); 
        window.scrollTo(0, 600); 
    };

    return (
        <footer
            id="Footer"
            className="bg-gray-900 text-gray-400 pt-16 px-6 md:px-20 lg:px-32 overflow-hidden"
        >
            <div className="container mx-auto flex flex-col md:flex-row justify-between gap-12 text-center md:text-left">

                {/* About Section */}
                <div className="md:w-1/2">
                    <img
                        src={assets.brandLogo}
                        alt="Vayuhu Logo"
                        className="w-32 h-auto md:w-40 object-contain mb-4 mx-auto md:mx-0"
                    />

                    <p className="text-sm leading-relaxed">
                        At <span className="text-orange-500 font-medium">Vayuhu</span>, we’re building more than just
                        workspaces — we’re creating a community where innovation thrives.
                        Whether you're a freelancer, startup, or small team, our space is designed
                        to help you work, connect, and grow together.
                    </p>
                </div>

                {/* Gallery + Blog Section */}
                <div className="md:w-1/3 flex flex-col items-center md:items-start justify-center">
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                        <Image className="text-orange-500" size={20} />
                        Explore Our Space
                    </h3>

                    {/* Gallery Button */}
                    <button
                        onClick={handleGalleryRedirect}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 mb-3"
                    >
                        View Gallery
                    </button>

                    {/* Blog Button */}
                    <button
                        onClick={() => navigate("/blog")}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-300"
                    >
                        Visit Blog
                    </button>
                </div>

                {/* Contact Info */}
                <div className="md:w-1/3">
                    <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex justify-center md:justify-start items-center gap-2">
                            <MapPin size={18} className="text-orange-500" />
                            <span>25 Kalpana Chawla Road, Bangalore 560094</span>
                        </div>
                        <div className="flex justify-center md:justify-start items-center gap-2">
                            <Phone size={18} className="text-orange-500" />
                            <a
                                href="tel:+917348857574"
                                className="hover:text-white transition"
                            >
                                +91 73488 57574
                            </a>
                        </div>
                        <div className="flex justify-center md:justify-start items-center gap-2">
                            <Mail size={18} className="text-orange-500" />
                            <a
                                href="mailto:support@vayuhu.com"
                                className="hover:text-white transition"
                            >
                                support@vayuhu.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 mt-12 py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Vayuhu. All Rights Reserved.
                <br className="md:hidden" />
                <span className="text-orange-500">
                    {" "}
                    Built with passion for modern professionals.
                </span>
            </div>
        </footer>
    );
};

export default Footer;
