import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Divider,
  IconButton, CircularProgress, Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Cart = () => {
  const { cart, fetchCart, removeFromCart, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Fetch cart on load ─────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [user]);

  // ── Update quantity ────────────────────────────────
  const handleUpdateQuantity = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put("/cart", { productId, quantity: newQty });
      fetchCart();
    } catch (err) {
      console.error("Update quantity error:", err.message);
    }
  };

  // ── Remove item ────────────────────────────────────
  const handleRemove = async (productId) => {
    await removeFromCart(productId);
  };

  // ── Calculate total ────────────────────────────────
  const total = cart.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  // ── Empty cart ─────────────────────────────────────
  if (cart.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 80, color: "grey.300", mb: 2 }}
          />
          <Typography variant="h5" fontWeight={700} color="text.secondary">
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} mb={4}>
            Add some products to get started
          </Typography>
          <Button
            variant="contained" size="large"
            onClick={() => navigate("/")}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Continue Shopping
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={3} color="text.primary">
          My Cart ({cartCount} items)
        </Typography>

        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>

          {/* Cart Items */}
          <Box sx={{ flex: 1 }}>
            {cart.map((item) => (
              <Paper
                key={item.product._id}
                elevation={0}
                sx={{
                  p: 2, mb: 2, borderRadius: 3,
                  border: "1px solid", borderColor: "grey.200",
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                {/* Product Image */}
                <Box
                  component="img"
                  src={item.product.image}
                  alt={item.product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/100x100/e8f5e9/00a278?text=Product`;
                  }}
                  sx={{
                    width: { xs: "100%", sm: 100 },
                    height: 100,
                    objectFit: "contain",
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    p: 1,
                  }}
                />

                {/* Product Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.product.name}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="primary" mt={0.5}>
                    ₹{item.product.price.toLocaleString()}
                  </Typography>
                </Box>

                {/* Quantity Controls */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    sx={{ border: "1px solid", borderColor: "grey.300", borderRadius: 1 }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>

                  <Typography variant="body1" fontWeight={700} sx={{ minWidth: 30, textAlign: "center" }}>
                    {item.quantity}
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                    sx={{ border: "1px solid", borderColor: "grey.300", borderRadius: 1 }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Item Total */}
                <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 100, textAlign: "right" }}>
                  ₹{(item.product.price * item.quantity).toLocaleString()}
                </Typography>

                {/* Remove Button */}
                <IconButton
                  color="error"
                  onClick={() => handleRemove(item.product._id)}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Paper>
            ))}
          </Box>

          {/* Order Summary */}
          <Box sx={{ width: { xs: "100%", md: 320 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 3,
                border: "1px solid", borderColor: "grey.200",
                position: { md: "sticky" },
                top: { md: 80 },
              }}
            >
              <Typography variant="h6" fontWeight={800} mb={2}>
                Order Summary
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {cart.map((item) => (
                <Box
                  key={item.product._id}
                  sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                  <Typography variant="body2" color="text.secondary"
                    sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {item.product.name} x{item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight={800}>Total</Typography>
                <Typography variant="h6" fontWeight={800} color="primary">
                  ₹{total.toLocaleString()}
                </Typography>
              </Box>

              <Button
                fullWidth variant="contained" size="large"
                onClick={() => navigate("/checkout")}
                sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, mb: 2 }}
              >
                Proceed to Checkout
              </Button>

              <Button
                fullWidth variant="outlined" size="large"
                onClick={() => navigate("/")}
                sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
              >
                Continue Shopping
              </Button>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Cart;