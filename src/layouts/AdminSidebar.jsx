import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    X,
    LogOut,
    ChevronDown,
    ChevronRight,
    Building2,
    ArrowLeft,
    PlusCircle,
    List,
    Calendar,
    Users2,
    Gift,
    Mail,
    FilePlus,
    FileText as BlogText,
    CreditCard,
    Settings,
} from "lucide-react";
import { assets } from "../assets/assets";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    // --- Load saved submenu states from localStorage ---
    const [submenus, setSubmenus] = useState(() => {
        return (
            JSON.parse(localStorage.getItem("adminSidebarState")) || {
                userMgmt: false,
                coupon: false,
                spaceMaster: false,
                contact: false,
                blog: false,
                virtualOffice: false,
            }
        );
    });

    // --- Persist submenu open/close state ---
    useEffect(() => {
        localStorage.setItem("adminSidebarState", JSON.stringify(submenus));
    }, [submenus]);

    const toggleSubmenu = (key) => {
        setSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
     ${isActive
            ? "bg-orange-500 text-white shadow-sm"
            : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
        }`;

    const handleLogout = () => {
        localStorage.removeItem("admin");
        window.dispatchEvent(new Event("adminUpdated"));
        navigate("/admin-login");
    };

    // --- Renders submenus dynamically ---
    const renderSubMenuButton = (label, Icon, key, children) => (
        <div>
            <button
                onClick={() => toggleSubmenu(key)}
                aria-expanded={submenus[key]}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
            >
                <span className="flex items-center gap-3">
                    <Icon size={18} /> {label}
                </span>
                {submenus[key] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            {submenus[key] && <div className="ml-8 mt-1 space-y-1">{children}</div>}
        </div>
    );

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) setIsOpen(false); // Auto close on mobile
    };

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r flex flex-col justify-between
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:static lg:shadow-none`}
            aria-label="Admin Sidebar"
        >
            {/* --- Mobile Close Button --- */}
            <button
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
                className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-orange-500"
            >
                <X size={22} />
            </button>

            {/* --- Header Logo --- */}
            <div className="flex items-center justify-center py-6 border-b bg-orange-50 lg:bg-white">
                <img
                    src={assets.brandLogo}
                    alt="Admin Logo"
                    className="w-32 cursor-pointer"
                    onClick={() => navigate("/admin")}
                />
            </div>

            {/* --- Navigation --- */}
            <nav className="mt-6 space-y-1 px-2 flex-1 overflow-y-auto">
                <NavLink to="/" className={linkClasses} onClick={handleLinkClick}>
                    <ArrowLeft size={18} /> Back to Website
                </NavLink>

                <NavLink to="/admin" end className={linkClasses} onClick={handleLinkClick}>
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>


                {/* --- User Management --- */}
                {renderSubMenuButton(
                    "User Management",
                    Users,
                    "userMgmt",
                    <>
                        <NavLink
                            to="/admin/add-user"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <PlusCircle size={16} /> Add User
                        </NavLink>
                        <NavLink
                            to="/admin/user-list"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <List size={16} /> User List
                        </NavLink>
                    </>
                )}

                {/* --- Reservation --- */}
                <NavLink
                    to="/admin/reservations"
                    className={linkClasses}
                    onClick={handleLinkClick}
                >
                    <Calendar size={18} /> Reservations
                </NavLink>

                {/* --- Visitors --- */}
                <NavLink
                    to="/admin/visitors"
                    className={linkClasses}
                    onClick={handleLinkClick}
                >
                    <Users2 size={18} /> Visitors
                </NavLink>

                {/* --- Coupon Codes --- */}
                {renderSubMenuButton(
                    "Coupon Codes",
                    Gift,
                    "coupon",
                    <>
                        <NavLink
                            to="/admin/add-coupon"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <PlusCircle size={16} /> Add Coupon
                        </NavLink>
                        <NavLink
                            to="/admin/coupon-list"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <List size={16} /> Coupon List
                        </NavLink>
                    </>
                )}

                {/* --- Space Master --- */}
                {renderSubMenuButton(
                    "Space Master",
                    Building2,
                    "spaceMaster",
                    <>
                        <NavLink
                            to="/admin/add-space-master"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <PlusCircle size={16} /> Add Space Master
                        </NavLink>
                        <NavLink
                            to="/admin/space-master-list"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <List size={16} /> Space Master List
                        </NavLink>
                    </>
                )}

                {/* --- Contact Request --- */}
                {renderSubMenuButton(
                    "Contact Request",
                    Mail,
                    "contact",
                    <>
                        <NavLink
                            to="/admin/add-contact"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <PlusCircle size={16} /> Add Contact
                        </NavLink>
                        <NavLink
                            to="/admin/contact-list"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <List size={16} /> Contact Request List
                        </NavLink>
                    </>
                )}

                {/* --- Blog --- */}
                {renderSubMenuButton(
                    "Blog",
                    BlogText,
                    "blog",
                    <>
                        <NavLink
                            to="/admin/add-blog"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <FilePlus size={16} /> Add New Blog
                        </NavLink>
                        <NavLink
                            to="/admin/blog-list"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <List size={16} /> View Blog List
                        </NavLink>
                    </>
                )}

                {/* --- Virtual Office --- */}
                {renderSubMenuButton(
                    "Virtual Office",
                    CreditCard,
                    "virtualOffice",
                    <>
                        <NavLink
                            to="/admin/virtual-office-price"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <FileText size={16} /> Price
                        </NavLink>
                        <NavLink
                            to="/admin/virtual-office-bookings"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <Calendar size={16} /> Bookings
                        </NavLink>
                        <NavLink
                            to="/admin/virtual-office-enquiries"
                            className={linkClasses}
                            onClick={handleLinkClick}
                        >
                            <Mail size={16} /> Enquiries
                        </NavLink>
                    </>
                )}

                {/* --- Settings --- */}
                <NavLink
                    to="/admin/settings"
                    className={linkClasses}
                    onClick={handleLinkClick}
                >
                    <Settings size={18} /> Settings
                </NavLink>
            </nav>

            {/* --- Footer --- */}
            <footer className="border-t bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 font-medium text-sm transition-all duration-200"
                >
                    <LogOut size={18} /> Logout
                </button>
            </footer>

            {/* --- Copyright --- */}
            <div className="text-center text-xs text-gray-500 py-3">
                <p>Vayuhu Admin © {new Date().getFullYear()}</p>
                <span className="text-orange-500">
                    {" "}
                    Managing with clarity and control.
                </span>
            </div>
        </aside>
    );
};

export default AdminSidebar;
