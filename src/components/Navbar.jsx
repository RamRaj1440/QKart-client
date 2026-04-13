import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Box,
  IconButton, Drawer, List, ListItem,
  ListItemButton, ListItemText, Divider, Badge,
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

  // ── Mobile Drawer ──────────────────────────────────
  const drawer = (
    <Box sx={{ width: 250 }}>
      <Typography
        variant="h6" fontWeight={800} color="primary"
        sx={{ p: 2 }}
      >
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

            {/* Cart */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setDrawerOpen(false); navigate("/cart"); }}>
                <Badge badgeContent={cartCount} color="error" sx={{ mr: 2 }}>
                  <ShoppingCartOutlinedIcon color="primary" />
                </Badge>
                <ListItemText primary="My Cart" />
              </ListItemButton>
            </ListItem>

            {/* Profile */}
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink} to="/profile"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>

            {/* Orders */}
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink} to="/orders"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary="My Orders" />
              </ListItemButton>
            </ListItem>

            {/* Admin */}
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

            <Divider />

            {/* Logout */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setDrawerOpen(false); handleLogout(); }}
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
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink} to="/login"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink} to="/register"
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
            variant="h5" fontWeight={800} color="primary"
            component={RouterLink} to="/"
            sx={{ textDecoration: "none" }}
          >
            QKart
          </Typography>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>

            {/* Cart Icon */}
            <IconButton color="primary" onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>

            {user ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Hi, {user.username || user.email}
                </Typography>

                <Button
                  component={RouterLink} to="/profile"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Profile
                </Button>

                <Button
                  component={RouterLink} to="/orders"
                  color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Orders
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

                <Button
                  variant="outlined" color="primary"
                  onClick={handleLogout}
                  sx={{ borderRadius: 2 }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink} to="/login"
                  variant="outlined" color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink} to="/register"
                  variant="contained" color="primary"
                  sx={{ borderRadius: 2 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>

          {/* Mobile — Cart + Hamburger */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 1 }}>
            <IconButton color="primary" onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={() => setDrawerOpen(true)} color="primary">
              <MenuIcon />
            </IconButton>
          </Box>

        </Toolbar>
      </AppBar>

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