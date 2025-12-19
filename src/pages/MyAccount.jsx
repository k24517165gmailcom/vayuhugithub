import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Load user data
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            navigate("/auth");
        }
    }, [navigate]);

    // ✅ Scroll to section if requested
    useEffect(() => {
        if (location.state?.scrollToMyAccount) {
            const section = document.getElementById("myaccount-section");
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: "smooth" });
                }, 400);
            }
        }
    }, [location.state]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("userUpdated"));
        navigate("/auth");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <section
                id="myaccount-section"
                className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center"
            >
                <h2 className="text-2xl font-semibold mb-4">My Account</h2>

                <div className="text-left mb-6">
                    <p className="mb-2"><strong>Name:</strong> {user.name}</p>
                    <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                    <p className="mb-2"><strong>User ID:</strong> {user.id}</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-full transition-all duration-300"
                >
                    Logout
                </button>
            </section>
        </div>
    );
};

export default MyAccount;
