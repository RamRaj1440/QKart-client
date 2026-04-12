import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Grid, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Select,
  MenuItem, CircularProgress, Alert, Tabs, Tab,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const statusColors = {
  placed: "primary",
  processing: "warning",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
  returned: "default",
};

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [addProductDialog, setAddProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", category: "", price: "",
    image: "", description: "", stock: "",
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, usersRes, productsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/orders"),
        api.get("/admin/users"),
        api.get("/products"),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Fetch admin data error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Update Order Status ────────────────────────────
  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? { ...o, status } : o)
      );
      setMessage({ type: "success", text: "Order status updated" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  // ── Delete User ────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setMessage({ type: "success", text: "User deleted" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete user" });
    }
  };

  // ── Delete Product ─────────────────────────────────
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setMessage({ type: "success", text: "Product deleted" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete product" });
    }
  };

  // ── Add Product ────────────────────────────────────
  const handleAddProduct = async () => {
    try {
      const { data } = await api.post("/admin/products", {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
      });
      setProducts((prev) => [...prev, data.product]);
      setAddProductDialog(false);
      setNewProduct({
        name: "", category: "", price: "",
        image: "", description: "", stock: "",
      });
      setMessage({ type: "success", text: "Product added successfully" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to add product" });
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          Admin Dashboard
        </Typography>

        {/* Message */}
        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            {
              label: "Total Users",
              value: stats?.totalUsers || 0,
              icon: <PeopleOutlineIcon fontSize="large" color="primary" />,
            },
            {
              label: "Total Orders",
              value: stats?.totalOrders || 0,
              icon: <ShoppingBagOutlinedIcon fontSize="large" color="primary" />,
            },
            {
              label: "Total Products",
              value: stats?.totalProducts || 0,
              icon: <InventoryOutlinedIcon fontSize="large" color="primary" />,
            },
            {
              label: "Total Revenue",
              value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
              icon: <CurrencyRupeeIcon fontSize="large" color="primary" />,
            },
          ].map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3, borderRadius: 3,
                  border: "1px solid", borderColor: "grey.200",
                  display: "flex", alignItems: "center", gap: 2,
                }}
              >
                {stat.icon}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {stat.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200" }}
        >
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}
          >
            <Tab label={`Orders (${orders.length})`} />
            <Tab label={`Users (${users.length})`} />
            <Tab label={`Products (${products.length})`} />
          </Tabs>

          <Box sx={{ p: 2 }}>

            {/* Orders Tab */}
            {tab === 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell fontWeight={700}>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Update</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          #{order._id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {order.user?.username || "N/A"}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {order.user?.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          ₹{order.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status.toUpperCase()}
                            color={statusColors[order.status] || "default"}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            sx={{ minWidth: 130 }}
                          >
                            {["placed", "processing", "shipped",
                              "delivered", "cancelled", "returned"].map((s) => (
                              <MenuItem key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Users Tab */}
            {tab === 1 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>₹{u.balance?.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Products Tab */}
            {tab === 2 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setAddProductDialog(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    + Add Product
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell>
                            <Box
                              component="img"
                              src={p.image}
                              alt={p.name}
                              sx={{ width: 40, height: 40, objectFit: "contain" }}
                            />
                          </TableCell>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.category}</TableCell>
                          <TableCell>₹{p.price?.toLocaleString()}</TableCell>
                          <TableCell>{p.stock}</TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteProduct(p._id)}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Add Product Dialog */}
      <Dialog
        open={addProductDialog}
        onClose={() => setAddProductDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700}>Add New Product</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <TextField
              fullWidth label="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            />
            <TextField
              fullWidth label="Price" type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <TextField
              fullWidth label="Image URL"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            />
            <TextField
              fullWidth label="Description" multiline rows={2}
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <TextField
              fullWidth label="Stock" type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setAddProductDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddProduct}
            sx={{ borderRadius: 2 }}
          >
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;