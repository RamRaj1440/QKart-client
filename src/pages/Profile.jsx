import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Paper, TextField,
  Button, Alert, CircularProgress, Divider,
  Avatar, Grid,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [orders, setOrders] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err.message);
    }
  };

  // ── Validate Profile ───────────────────────────────
  const validateProfile = () => {
    const errors = {};
    if (!profileData.username.trim())
      errors.username = "Username is required";
    if (!profileData.email.trim())
      errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email))
      errors.email = "Enter a valid email";
    return errors;
  };

  // ── Validate Password ──────────────────────────────
  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword)
      errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      errors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";
    if (!passwordData.confirmNewPassword)
      errors.confirmNewPassword = "Please confirm new password";
    else if (passwordData.newPassword !== passwordData.confirmNewPassword)
      errors.confirmNewPassword = "Passwords do not match";
    return errors;
  };

  // ── Update Profile ─────────────────────────────────
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage(null);

    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileLoading(true);
    try {
      const { data } = await api.put("/auth/profile", {
        username: profileData.username,
        email: profileData.email,
      });

      // Update context + localStorage
      login({
        _id: data._id,
        username: data.username,
        email: data.email,
        balance: data.balance,
        isAdmin: data.isAdmin,
        token: data.token,
      });

      setProfileMessage({
        type: "success",
        text: " Profile updated successfully!",
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Update Password ────────────────────────────────
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put("/auth/profile", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage({
        type: "success",
        text: " Password updated successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={800} mb={3}>
          My Profile
        </Typography>

        <Grid container spacing={3}>

          {/* Left Column — Profile Info */}
          <Grid size={{ xs: 12, md: 8 }}>

            {/* Profile Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3, mb: 3, borderRadius: 3,
                border: "1px solid", borderColor: "grey.200",
              }}
            >
              {/* Avatar + Name */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 64, height: 64,
                    bgcolor: "primary.main",
                    fontSize: 28, fontWeight: 800,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {user?.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Form */}
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                <PersonOutlineIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Personal Information
              </Typography>

              {profileMessage && (
                <Alert severity={profileMessage.type} sx={{ mb: 2 }}>
                  {profileMessage.text}
                </Alert>
              )}

              <Box component="form" onSubmit={handleProfileUpdate}>
                <TextField
                  fullWidth label="Username"
                  value={profileData.username}
                  onChange={(e) => {
                    setProfileData({ ...profileData, username: e.target.value });
                    setProfileErrors({ ...profileErrors, username: "" });
                  }}
                  error={!!profileErrors.username}
                  helperText={profileErrors.username}
                  margin="normal"
                />
                <TextField
                  fullWidth label="Email Address" type="email"
                  value={profileData.email}
                  onChange={(e) => {
                    setProfileData({ ...profileData, email: e.target.value });
                    setProfileErrors({ ...profileErrors, email: "" });
                  }}
                  error={!!profileErrors.email}
                  helperText={profileErrors.email}
                  margin="normal"
                />
                <Button
                  type="submit" variant="contained"
                  disabled={profileLoading}
                  sx={{ mt: 2, borderRadius: 2, px: 4 }}
                >
                  {profileLoading
                    ? <CircularProgress size={20} color="inherit" />
                    : "Update Profile"
                  }
                </Button>
              </Box>
            </Paper>

            {/* Password Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 3,
                border: "1px solid", borderColor: "grey.200",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                <LockOutlinedIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Change Password
              </Typography>

              {passwordMessage && (
                <Alert severity={passwordMessage.type} sx={{ mb: 2 }}>
                  {passwordMessage.text}
                </Alert>
              )}

              <Box component="form" onSubmit={handlePasswordUpdate}>
                <TextField
                  fullWidth label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value });
                    setPasswordErrors({ ...passwordErrors, currentPassword: "" });
                  }}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  margin="normal"
                />
                <TextField
                  fullWidth label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                    setPasswordErrors({ ...passwordErrors, newPassword: "" });
                  }}
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword}
                  margin="normal"
                />
                <TextField
                  fullWidth label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmNewPassword: e.target.value });
                    setPasswordErrors({ ...passwordErrors, confirmNewPassword: "" });
                  }}
                  error={!!passwordErrors.confirmNewPassword}
                  helperText={passwordErrors.confirmNewPassword}
                  margin="normal"
                />
                <Button
                  type="submit" variant="outlined"
                  disabled={passwordLoading}
                  sx={{ mt: 2, borderRadius: 2, px: 4 }}
                >
                  {passwordLoading
                    ? <CircularProgress size={20} color="inherit" />
                    : "Update Password"
                  }
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column — Stats */}
          <Grid size={{ xs: 12, md: 4 }}>

            {/* Wallet Balance */}
            <Paper
              elevation={0}
              sx={{
                p: 3, mb: 3, borderRadius: 3,
                border: "1px solid", borderColor: "grey.200",
                textAlign: "center",
              }}
            >
              <AccountBalanceWalletOutlinedIcon
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Wallet Balance
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary">
                ₹{user?.balance?.toLocaleString()}
              </Typography>
            </Paper>

            {/* Order Stats */}
            <Paper
              elevation={0}
              sx={{
                p: 3, mb: 3, borderRadius: 3,
                border: "1px solid", borderColor: "grey.200",
                textAlign: "center",
              }}
            >
              <ShoppingBagOutlinedIcon
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary">
                {orders.length}
              </Typography>
            </Paper>

            {/* Order Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 3,
                border: "1px solid", borderColor: "grey.200",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Order Summary
              </Typography>
              {[
                "placed", "processing", "shipped",
                "delivered", "cancelled", "returned"
              ].map((status) => (
                <Box
                  key={status}
                  sx={{
                    display: "flex", justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2" color="text.secondary"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {status}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {orders.filter((o) => o.status === status).length}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;