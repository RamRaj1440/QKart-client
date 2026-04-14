import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Grid,
  Chip, CircularProgress, Divider, Rating,
  Paper, IconButton, Alert,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import StarIcon from "@mui/icons-material/Star";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);

      // Fetch related products same category
      const allProducts = await api.get(
        `/products?category=${data.category}`
      );
      setRelatedProducts(
        allProducts.data.filter((p) => p._id !== id).slice(0, 4)
      );
    } catch (err) {
      console.error("Fetch product error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setAdding(true);
    const result = await addToCart(product._id, quantity);
    setAdding(false);

    if (result.success) {
      setMessage({
        type: "success",
        text: ` ${product.name} (x${quantity}) added to cart!`,
      });
    } else {
      setMessage({
        type: "error",
        text: result.message || "Failed to add to cart",
      });
    }

    setTimeout(() => setMessage(null), 3000);
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

  if (!product) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h5" color="text.secondary">
            Product not found
          </Typography>
          <Button
            variant="contained" onClick={() => navigate("/")}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Back
        </Button>

        {/* Alert Message */}
        {message && (
          <Alert
            severity={message.type}
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Product Main Section */}
        <Grid container spacing={4}>

          {/* Product Image */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 3,
                border: "1px solid", borderColor: "grey.200",
                bgcolor: "white",
              }}
            >
              <Box
                component="img"
                src={product.image}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/400x400/e8f5e9/00a278?text=${encodeURIComponent(product.name)}`;
                }}
                sx={{
                  width: "100%",
                  height: { xs: 250, md: 350 },
                  objectFit: "contain",
                }}
              />
            </Paper>
          </Grid>

          {/* Product Info */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box>
              {/* Category */}
              <Chip
                label={product.category}
                size="small"
                sx={{
                  mb: 2, bgcolor: "primary.main",
                  color: "white", fontWeight: 600,
                }}
              />

              {/* Name */}
              <Typography variant="h4" fontWeight={800} mb={2}
                sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
              >
                {product.name}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Rating
                  value={product.rating}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" fontWeight={600}>
                  {product.rating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({product.reviews?.toLocaleString()} reviews)
                </Typography>
              </Box>

              {/* Price */}
              <Typography variant="h3" fontWeight={800} color="primary" mb={2}
                sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
              >
                ₹{product.price?.toLocaleString()}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Description */}
              <Typography variant="body1" color="text.secondary" mb={3}>
                {product.description || "No description available."}
              </Typography>

              {/* Stock */}
              <Typography variant="body2" mb={3}>
                {product.stock > 0 ? (
                  <span style={{ color: "#00a278", fontWeight: 600 }}>
                     In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span style={{ color: "red", fontWeight: 600 }}>
                     Out of Stock
                  </span>
                )}
              </Typography>

              {/* Quantity Selector */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Typography variant="body1" fontWeight={600}>
                  Quantity:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    sx={{
                      border: "1px solid", borderColor: "grey.300",
                      borderRadius: 1,
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body1" fontWeight={700} sx={{ minWidth: 30, textAlign: "center" }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    sx={{
                      border: "1px solid", borderColor: "grey.300",
                      borderRadius: 1,
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Add to Cart Button */}
              <Button
                fullWidth variant="contained" size="large"
                startIcon={<ShoppingCartOutlinedIcon />}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, mb: 2 }}
              >
                {adding
                  ? <CircularProgress size={24} color="inherit" />
                  : `Add ${quantity} to Cart — ₹${(product.price * quantity).toLocaleString()}`
                }
              </Button>

              <Divider sx={{ my: 3 }} />

              {/* Features */}
              <Grid container spacing={2}>
                {[
                  {
                    icon: <LocalShippingOutlinedIcon color="primary" />,
                    title: "Free Delivery",
                    desc: "On orders above ₹500",
                  },
                  {
                    icon: <VerifiedOutlinedIcon color="primary" />,
                    title: "Genuine Product",
                    desc: "100% authentic",
                  },
                  {
                    icon: <CachedOutlinedIcon color="primary" />,
                    title: "Easy Returns",
                    desc: "7 day return policy",
                  },
                ].map((f, i) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={i}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      {f.icon}
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {f.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {f.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={800} mb={3}>
              Related Products
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((p) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p._id}>
                  <Paper
                    elevation={0}
                    onClick={() => navigate(`/products/${p._id}`)}
                    sx={{
                      p: 2, borderRadius: 3, cursor: "pointer",
                      border: "1px solid", borderColor: "grey.200",
                      transition: "box-shadow 0.2s",
                      "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.10)" },
                    }}
                  >
                    <Box
                      component="img"
                      src={p.image}
                      alt={p.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/200x200/e8f5e9/00a278?text=Product`;
                      }}
                      sx={{
                        width: "100%", height: 150,
                        objectFit: "contain", mb: 1,
                      }}
                    />
                    <Typography variant="body2" fontWeight={700}
                      sx={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {p.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <StarIcon sx={{ color: "#f5a623", fontSize: 14 }} />
                      <Typography variant="caption">{p.rating}</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={800} color="primary" mt={0.5}>
                      ₹{p.price?.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetails;