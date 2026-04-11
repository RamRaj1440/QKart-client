import { useState, useMemo, useEffect } from "react";
import {
  Box, Container, Typography, Grid,
  TextField, InputAdornment, Chip, Stack,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const ALL = "All";

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL);

  // ── Fetch Real Products from Backend ──────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Unique Categories ──────────────────────────────
  const categories = useMemo(() => {
    return [ALL, ...new Set(products.map((p) => p.category))];
  }, [products]);

  // ── Filter Logic ───────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === ALL || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Navbar />

      {/* Hero Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
          py: { xs: 4, md: 6 },
          px: 2,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4" fontWeight={800} color="primary"
            sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" } }}
          >
            {user
              ? `Welcome back, ${user.username || user.email}! `
              : "Welcome to QKart "}
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1} mb={3}>
            Discover amazing products at unbeatable prices.
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      {/* Category Filter */}
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              onClick={() => setActiveCategory(cat)}
              color={activeCategory === cat ? "primary" : "default"}
              sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
            />
          ))}
        </Stack>
      </Container>

      {/* Products Grid */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {loading ? (
          <Box textAlign="center" py={8}>
            <CircularProgress color="primary" />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading products...
            </Typography>
          </Box>
        ) : filtered.length > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {activeCategory !== ALL ? ` in "${activeCategory}"` : ""}
              {search ? ` for "${search}"` : ""}
            </Typography>
            <Grid container spacing={3}>
              {filtered.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
               No products found
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Try a different search or category
            </Typography>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: "white", borderTop: "1px solid",
          borderColor: "grey.200", py: 3,
          textAlign: "center", mt: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2025 QKart. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;