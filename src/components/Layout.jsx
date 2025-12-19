import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { assets } from "../assets/assets"; // ✅ import your logo asset

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ─── Sidebar ─── */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none`}
      >
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* ─── Mobile Overlay ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Top Bar (Mobile Only) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
          {/* ✅ Replace text with logo */}
          <img
            src={assets.brandLogo}
            alt="Vayuhu Logo"
            className="w-28 sm:w-32 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
            className="p-2 rounded-lg bg-white border border-gray-200 
                       hover:bg-orange-50 text-gray-600 hover:text-orange-500 
                       shadow-sm transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
