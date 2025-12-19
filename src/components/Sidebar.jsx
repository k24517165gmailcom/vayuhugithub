import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  CalendarDays,
  FileText,
  ArrowLeft,
  X,
  LogOut,
  Building2,
  UserCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { assets } from "../assets/assets";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  // ✅ Submenu toggles
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isVisitorsOpen, setIsVisitorsOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
     ${isActive
      ? "bg-orange-500 text-white shadow-sm"
      : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/auth"); // redirect to auth page
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight, // scrolls to bottom (auth component)
        behavior: "smooth",
      });
    }, 300); // small delay to ensure navigation finishes
  };


  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r flex flex-col justify-between
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:static lg:shadow-none`}
      aria-label="Sidebar"
    >
      {/* --- Mobile Close Button --- */}
      <button
        onClick={() => setIsOpen(false)}
        aria-label="Close sidebar"
        className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-orange-500"
      >
        <X size={22} />
      </button>

      {/* --- Header (Logo) --- */}
      <div className="flex items-center justify-center py-6 border-b bg-orange-50 lg:bg-white">
        <img
          src={assets.brandLogo}
          alt="Vayuhu Logo"
          className="w-32 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        />
      </div>

      {/* --- Navigation --- */}
      <nav className="mt-6 space-y-1 px-2 flex-1 overflow-y-auto">
        {/* Go Back */}
        <NavLink to="/" className={linkClasses} onClick={() => setIsOpen(false)}>
          <ArrowLeft size={18} /> Go Back To Website
        </NavLink>

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={linkClasses}
          onClick={() => setIsOpen(false)}
        >
          <Home size={18} /> Dashboard
        </NavLink>

        {/* --- Users with submenu --- */}
        <div>
          <button
            onClick={() => setIsUsersOpen(!isUsersOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
          >
            <span className="flex items-center gap-3">
              <Users size={18} /> Users
            </span>
            {isUsersOpen ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>

          {isUsersOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <NavLink
                to="/profile"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                <UserCircle size={16} /> Profile
              </NavLink>
              <NavLink
                to="/company-profile"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                <Building2 size={16} /> Company Profile
              </NavLink>
            </div>
          )}
        </div>

        {/* --- Reservations --- */}
        <NavLink
          to="/reservations"
          className={linkClasses}
          onClick={() => setIsOpen(false)}
        >
          <CalendarDays size={18} /> Reservations
        </NavLink>

        {/* --- Visitors with submenu --- */}
        <div>
          <button
            onClick={() => setIsVisitorsOpen(!isVisitorsOpen)}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
          >
            <span className="flex items-center gap-3">
              <FileText size={18} /> Visitors
            </span>
            {isVisitorsOpen ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>

          {isVisitorsOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <NavLink
                to="/visitors"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                <FileText size={16} /> Visitors
              </NavLink>
              <NavLink
                to="/visitors-details"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                <ClipboardList size={16} /> Visitors Details
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* --- Footer --- */}
      <footer className="border-t bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 border-t text-red-500 hover:bg-red-50 
     font-medium text-sm transition-all duration-200"
        >
          <LogOut size={18} /> Logout
        </button>
      </footer>


      {/* --- Copyright --- */}
      <div className="text-center text-xs text-gray-500 py-3">
        <p>Vayuhu © {new Date().getFullYear()}</p>
        <span className="text-orange-500">
          {" "}
          Built with passion for modern professionals.
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
