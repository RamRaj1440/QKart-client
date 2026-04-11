import { createContext, useState, useContext, useCallback } from "react";
import api from "../utils/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // ── Fetch Cart ─────────────────────────────────────
  const fetchCart = useCallback(async () => {
    try {
      const { data } = await api.get("/cart");
      setCart(data.items || []);
      setCartCount(
        data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      );
    } catch (err) {
      console.error("Fetch cart error:", err.message);
    }
  }, []);

  // ── Add to Cart ────────────────────────────────────
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      setCart(data.cart.items || []);
      setCartCount(
        data.cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  // ── Remove from Cart ───────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data.cart.items || []);
      setCartCount(
        data.cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      );
    } catch (err) {
      console.error("Remove from cart error:", err.message);
    }
  }, []);

  // ── Clear Cart ─────────────────────────────────────
  const clearCart = useCallback(async () => {
    try {
      await api.delete("/cart/clear");
      setCart([]);
      setCartCount(0);
    } catch (err) {
      console.error("Clear cart error:", err.message);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, fetchCart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};

export default CartContext;