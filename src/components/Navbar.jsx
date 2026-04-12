import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, fetchCart } = useCart();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCartClick = () => {
    setDrawerOpen(false);
    navigate("/cart");
  };

  // ── Mobile Drawer ──────────────────────────────────
  const drawer = (
    <Box sx={{ width: 250 }}>
      {/* Brand */}
      <Typography variant="h6" fontWeight={800} color="primary" sx={{ p: 2 }}>
        QKart
      </Typography>
      <Divider />

      <List>
        {user ? (
          <>
            {/* User Info */}
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText
                  primary={user.username || user.email}
                  secondary="Logged in"
                />
              </ListItemButton>
            </ListItem>

            <Divider />

            {/* Cart in Drawer */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleCartClick}>
                <Badge badgeContent={cartCount} color="error" sx={{ mr: 2 }}>
                  <ShoppingCartOutlinedIcon color="primary" />
                </Badge>
                <ListItemText primary="My Cart" />
              </ListItemButton>
            </ListItem>

            <Divider />

            <Button
              component={RouterLink}
              to="/orders"
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              Orders
            </Button>

            {/* Logout */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
              >
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ color: "error" }}
                />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            {/* Login */}
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/login"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>

            {/* Register */}
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/register"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: "white" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Typography
            variant="h5"
            fontWeight={800}
            color="primary"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none" }}
          >
            QKart
          </Typography>

          {/* Desktop Nav */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Cart Icon */}
            <IconButton color="primary" onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>

            {user ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  Hi, {user.username || user.email}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleLogout}
                  sx={{ borderRadius: 2 }}
                >
                  Logout
                </Button>

                {user?.isAdmin && (
  <Button
    component={RouterLink} to="/admin"
    variant="contained" color="primary"
    sx={{ borderRadius: 2 }}
  >
    Admin
  </Button>
)}
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>

          {/* Mobile — Cart Icon + Hamburger */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Cart visible on mobile too */}
            <IconButton color="primary" onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>

            {/* Hamburger */}
            <IconButton onClick={() => setDrawerOpen(true)} color="primary">
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <ListItem disablePadding>
        <ListItemButton
          component={RouterLink}
          to="/orders"
          onClick={() => setDrawerOpen(false)}
        >
          <ListItemText primary="My Orders" />
        </ListItemButton>
      </ListItem>

      {user?.isAdmin && (
  <ListItem disablePadding>
    <ListItemButton
      component={RouterLink} to="/admin"
      onClick={() => setDrawerOpen(false)}
    >
      <ListItemText primary="Admin Dashboard" />
    </ListItemButton>
  </ListItem>
)}

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
