import { useState } from "react";
import {
  Box, Container, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Link,
} from "@mui/material";
import {
  Visibility, VisibilityOff,
  PersonOutline, EmailOutlined, LockOutlined,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../utils/api";
const validate = ({ username, email, password, confirmPassword }) => {
  const errors = {};
  if (!username) errors.username = "Username is required";
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters";
  if (!confirmPassword) errors.confirmPassword = "Confirm your password";
  else if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  return errors;
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess(false);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2500);
  } catch (err) {
    setApiError(
      err.response?.data?.message || "Registration failed. Try again."
    );
    setLoading(false);
  }
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            p: { xs: 3, sm: 5 },
          }}
        >
          {/* Brand */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight={800} color="primary" letterSpacing={1}>
              QKart
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Create your account to get started
            </Typography>
          </Box>

          {/* Alerts */}
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Account created successfully! 
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="Full Name" name="username"
              value={formData.username} onChange={handleChange}
              error={!!errors.username} helperText={errors.username}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth label="Email Address" name="email" type="email"
              value={formData.email} onChange={handleChange}
              error={!!errors.email} helperText={errors.email}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth label="Password" name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password} onChange={handleChange}
              error={!!errors.password} helperText={errors.password}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((p) => !p)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth label="Confirm Password" name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword} onChange={handleChange}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((p) => !p)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit" fullWidth variant="contained"
              size="large" disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
            </Button>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              Already have an account?{" "}
              <Link
                component={RouterLink} to="/login"
                color="primary" fontWeight={600} underline="hover"
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;