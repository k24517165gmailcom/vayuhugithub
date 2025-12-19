import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// 🛒 Import the CartProvider
import { CartProvider } from "./context/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Wrap your entire app with CartProvider */}
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
);
