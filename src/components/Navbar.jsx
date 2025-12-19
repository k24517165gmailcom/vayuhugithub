import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = (id) => {
    setShowMobileMenu(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 400);
    } else {
      scrollToSection(id);
    }
  };

  const handleVirtualOffice = () => {
    setShowMobileMenu(false);
    if (location.pathname !== "/virtual") {
      navigate("/virtual");
      setTimeout(() => scrollToSection("VirtualOfficeServices"), 400);
    } else {
      scrollToSection("VirtualOfficeServices");
    }
  };

  const navItems = [
    { label: "Home", action: () => handleNavClick("Header") },
    { label: "About", action: () => handleNavClick("About") },
    { label: "WorkSpaces", action: () => handleNavClick("WorkSpaces") },
    { label: "Testimonials", action: () => handleNavClick("Testimonials") },
    { label: "Virtual Office", action: handleVirtualOffice },
  ];

  return (
    <>
      {/* Navbar */}
      <div
  className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
    isScrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent"
  }`}
>
  <div className="container mx-auto flex items-center py-3 px-4 sm:px-8 md:px-16 lg:px-24 justify-between">
    
    {/* Logo on the left */}
    <div className="flex justify-start flex-1">
      <img
        src={assets.brandLogo}
        alt="Vayuhu Logo"
        className="w-28 sm:w-32 md:w-36 lg:w-40 cursor-pointer"
        onClick={() => {
          setShowMobileMenu(false);
          if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 400);
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      />
    </div>

    {/* Nav links in the center (unchanged) */}
    <div className="hidden md:flex items-center gap-4">
      {navItems.map((item) => (
        <motion.button
          key={item.label}
          onClick={item.action}
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 10px 20px rgba(255,127,80,0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-full font-medium text-orange-400 bg-white/0 border border-orange-400 text-sm sm:text-base transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600 hover:text-white"
        >
          {item.label}
        </motion.button>
      ))}
    </div>

    {/* CTA Button & Mobile Icon on the right */}
    <div className="flex justify-end flex-1 items-center gap-4">
      <button
        onClick={() => navigate(user ? "/dashboard" : "/auth")}
        className="hidden md:block bg-black text-white font-semibold px-6 py-3 rounded-full hover:text-white hover: bg-orange-500 transition-all duration-300"
      >
        {user ? "My Account" : "Sign up / Login"}
      </button>

      {/* Mobile Menu Icon */}
      <img
        onClick={() => setShowMobileMenu(true)}
        src={assets.menu_icon}
        className="md:hidden w-6 sm:w-7 cursor-pointer invert"
        alt="menu icon"
      />
    </div>
  </div>
</div>


      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
          showMobileMenu ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Close Button */}
        <img
          onClick={() => setShowMobileMenu(false)}
          src={assets.cross_icon}
          className="absolute top-6 right-6 w-6 cursor-pointer"
          alt="close menu"
        />

        {/* Mobile Nav Links */}
        <ul className="flex flex-col items-center gap-6 text-lg font-semibold">
          {navItems.map((item) => (
            <motion.button
              key={item.label}
              onClick={item.action}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 20px rgba(255,127,80,0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-full text-orange-400 bg-white/0 hover:bg-gradient-to-r hover:from-orange-400 hover:via-red-900 hover:to-orange-600 hover:text-white transition-all duration-300"
            >
              {item.label}
            </motion.button>
          ))}
        </ul>

        {/* Mobile CTA */}
        <button
          onClick={() => {
            setShowMobileMenu(false);
            navigate(user ? "/dashboard" : "/auth");
          }}
          className="mt-8 bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-full transition-all duration-300"
        >
          {user ? "My Account" : "Sign up / Login"}
        </button>
      </div>
    </>
  );
};

export default Navbar;
