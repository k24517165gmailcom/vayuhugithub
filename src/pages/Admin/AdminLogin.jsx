import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Imported Axios

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Use environment variable for API base URL
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = `${API_BASE}/admin_login.php`;
    const payload = { email, password };

    console.log("Submitting admin login form via Axios:", payload);

    try {
      // ✅ Using Axios POST request
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Axios response:", response);

      const result = response.data; // Axios automatically parses JSON
      console.log("Parsed response:", result);

      setMessage(result.message);

      if (result.status === "success" && result.admin) {
        // ✅ Save JWT token if provided
        if (result.token) {
          localStorage.setItem("token", result.token);
          console.log("Saved JWT token:", result.token);
        }

        // ✅ Save admin info
        localStorage.setItem("admin", JSON.stringify(result.admin));

        // Optional: trigger reactivity elsewhere
        window.dispatchEvent(new Event("adminUpdated"));

        // ✅ Navigate to admin dashboard
        setTimeout(() => navigate("/admin"), 800);
      }
    } catch (error) {
      console.error("Admin login error:", error);
      // ✅ Improved error messaging for Axios
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      setMessage(errorMsg);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 700, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Admin Login 👨‍💼
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 mb-3 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 mb-4 rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition-all"
          >
            Login
          </button>

          {message && (
            <p
              className={`mt-4 text-center text-sm font-medium ${
                message.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Back to{" "}
          <span
            onClick={() => navigate("/")}
            className="text-orange-500 font-medium cursor-pointer hover:underline"
          >
            main site
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;