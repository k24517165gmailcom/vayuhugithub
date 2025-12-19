import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const FloatingCartButton = ({ onClick }) => {
  const { cart } = useCart();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 relative"
    >
      <ShoppingCart />
      {cart.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {cart.length}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;
