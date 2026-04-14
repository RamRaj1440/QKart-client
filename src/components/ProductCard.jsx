import { useState } from "react";
import {
  Card, CardMedia, CardContent, CardActions,
  Typography, Button, Box, Chip, Snackbar, Alert,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StarIcon from "@mui/icons-material/Star";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAddToCart = async () => {
    // If not logged in redirect to login
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    const result = await addToCart(product._id, 1);
    setLoading(false);

    if (result.success) {
      setSnackbar({
        open: true,
        message: ` ${product.name} added to cart!`,
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: result.message || "Failed to add to cart",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.10)" },
        }}
      >
        {/* Product Image */}
        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.name}
          on Click={() => navigate(`/products/${product._id}`)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/300x200/e8f5e9/00a278?text=${encodeURIComponent(product.name)}`;
          }}
          sx={{ objectFit: "contain", p: 2, bgcolor: "grey.50",cursor: "pointer"}}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          {/* Category */}
          <Chip
            label={product.category}
            size="small"
            sx={{ mb: 1, bgcolor: "primary.main", color: "white", fontWeight: 600 }}
          />

          {/* Name */}
          <Typography
            variant="subtitle1" fontWeight={700}
            onClick={() => navigate(`/products/${product._id}`)}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1,
              cursor: "pointer",
              "&:hover": { color: "primary.main" },
            }}
          >
            {product.name}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <StarIcon sx={{ color: "#f5a623", fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600}>
              {product.rating}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ({product.reviews} reviews)
            </Typography>
          </Box>

          {/* Price */}
          <Typography variant="h6" fontWeight={800} color="primary">
            ₹{product.price.toLocaleString()}
          </Typography>
        </CardContent>

        {/* Add to Cart Button */}
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth variant="contained"
            startIcon={<ShoppingCartOutlinedIcon />}
            onClick={handleAddToCart}
            disabled={loading}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {loading ? <CircularProgress size={24} /> : "Add to Cart"}
          </Button>
        </CardActions>
      </Card>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;