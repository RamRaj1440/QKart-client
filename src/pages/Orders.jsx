import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Paper,
  Chip, Divider, Button, CircularProgress,
  Stepper, Step, StepLabel,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import socket from "../utils/socket";

// ── Status config ──────────────────────────────────────
const statusColors = {
  placed: "primary",
  processing: "warning",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
  returned: "default",
};

const statusSteps = ["placed", "processing", "shipped", "delivered"];

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");


  // ── Return Dialog ──────────────────────────────────
  const [returnDialog, setReturnDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();

    // ── Connect socket ─────────────────────────────────
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);

      // ── Join room for each order ───────────────────
      data.forEach((order) => {
        socket.emit("join_order", order._id);
      });
    } catch (err) {
      console.error("Fetch orders error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Listen for real-time status updates ────────────
  useEffect(() => {
    socket.on("order_status_update", ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    });

    return () => {
      socket.off("order_status_update");
    };
  }, []);

  // ── Cancel Order ───────────────────────────────────
  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setActionLoading(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status: "cancelled" } : o)
      );
      setActionMessage({
        type: "success",
        text: `Order cancelled. ₹${data.refundAmount.toLocaleString()} refunded to wallet.`,
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to cancel order",
      });
    } finally {
      setActionLoading("");
    }
  };

  // ── Return Order ───────────────────────────────────
  const handleReturn = async () => {
    if (!selectedOrder) return;

    setActionLoading(selectedOrder._id);
    try {
      const { data } = await api.put(`/orders/${selectedOrder._id}/return`, {
        reason: returnReason,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id ? { ...o, status: "returned" } : o
        )
      );

       setActionMessage({
        type: "success",
        text: `Return submitted. ₹${data.refundAmount.toLocaleString()} refunded to wallet.`,
      });
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit return",
      });
    } finally {
      setActionLoading("");
      setReturnDialog(false);
      setReturnReason("");
      setSelectedOrder(null);
    }
  };


  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Navbar />
        <Box textAlign="center" py={8}>
          <CircularProgress color="primary" />
        </Box>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} color="text.secondary">
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} mb={4}>
            Place your first order to see it here
          </Typography>
          <Button
            variant="contained" size="large"
            onClick={() => navigate("/")}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Start Shopping
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Navbar />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          My Orders
        </Typography>

        {orders.map((order) => (
          <Paper
            key={order._id}
            elevation={0}
            sx={{
              p: 3, mb: 3, borderRadius: 3,
              border: "1px solid", borderColor: "grey.200",
            }}
          >
            {/* Order Header */}
            <Box sx={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2,
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  #{order._id.slice(-8).toUpperCase()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </Typography>
              </Box>

              <Chip
                label={order.status.toUpperCase()}
                color={statusColors[order.status] || "default"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            {/* ── Real-time Order Tracker ────────────── */}
            {order.status !== "cancelled" && (
              <Box sx={{ mb: 3, mt: 1 }}>
                <Stepper
                  activeStep={statusSteps.indexOf(order.status)}
                  alternativeLabel
                >
                  {statusSteps.map((step) => (
                    <Step key={step}>
                      <StepLabel>
                        <Typography variant="caption" fontWeight={600}
                          sx={{ textTransform: "capitalize" }}>
                          {step}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Order Items */}
            {order.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/50x50/e8f5e9/00a278?text=P`;
                    }}
                    sx={{
                      width: 50, height: 50,
                      objectFit: "contain",
                      borderRadius: 1,
                      bgcolor: "grey.50", p: 0.5,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" fontWeight={700}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            {/* Shipping Address */}
            <Typography variant="body2" color="text.secondary">
               {order.shippingAddress.street},{" "}
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </Typography>

            {/* Expected Delivery */}
{!["cancelled", "returned"].includes(order.status) && (
  <Typography variant="body2" color="primary" mt={0.5} fontWeight={600}>
    🚚 Expected Delivery:{" "}
    {order.expectedDelivery
      ? new Date(order.expectedDelivery).toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date(
          new Date(order.createdAt).setDate(
            new Date(order.createdAt).getDate() + 5
          )
        ).toLocaleDateString("en-IN", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
  </Typography>
)}

            {/* Payment Status */}
            <Typography variant="body2" color="text.secondary" mt={0.5}>
               Payment: {order.isPaid ? " Paid" : " Pending"}
            </Typography>

            {/* Total */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Typography variant="h6" fontWeight={800} color="primary">
                Total: ₹{order.totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        ))}

        <Button
          variant="outlined" fullWidth size="large"
          onClick={() => navigate("/")}
          sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
        >
          Continue Shopping
        </Button>
      </Container>
    </Box>
  );
};

export default Orders;