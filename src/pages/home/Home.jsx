import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import "../CustomerDashboard/CustomerDashboard.css";
import "./Home.css";


const API_BASE = "api/v1";
const PRODUCTS_API = `${API_BASE}/products`;
const IMAGE_API = `${API_BASE}/image`;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${PRODUCTS_API}/customer/all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      const processedProducts = Array.isArray(data) ? data : data.data || [];
      const normalizedProducts = processedProducts.map((product) => ({
        ...product,
        images:
          product.images?.map((img) => ({
            id: img.imageId || img.id,
            fileName: img.imageName || img.fileName,
            viewUrl: `${IMAGE_API}/images/view/${img.imageId || img.id}`,
            downloadUrl: `${IMAGE_API}/images/download/${img.imageId || img.id}`,
          })) || [],
      }));

      setProducts(normalizedProducts);

      const uniqueCategories = [
        ...new Set(
          processedProducts.map((p) => p.category?.name).filter(Boolean)
        ),
      ];
      const uniqueBrands = [
        ...new Set(processedProducts.map((p) => p.brand).filter(Boolean)),
      ];

      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
      setError("");
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "" || product.category?.name === selectedCategory;
    const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="home-page p-4">
      {/* Header / Navigation Bar */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">meroPASAL</h1>
        <div className="flex gap-2">
          <Link to="/login" className="btn-login">Login</Link>
            <Link to="/signup" className="btn-signup">Signup</Link>

        </div>
      </header>

      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Filters */}
      <div className="filters flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="product-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card border rounded p-4">
              {product.images && product.images[0] ? (
                <img
                  src={`${IMAGE_API}/images/view/${product.images[0].id}`}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-2"
                />
              ) : (
                <div className="bg-gray-200 w-full h-48 flex items-center justify-center mb-2">No Image</div>
              )}
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.brand}</p>
              <p className="font-bold">${product.price?.toFixed(2)}</p>
            <Link
              to="/login"
              onClick={() => localStorage.setItem("redirectAfterLogin", `/product/${product.id}`)}
              className="btn-buy"
            >
              Login to Buy
            </Link>


            </div>
          ))
        ) : (
          <div>No products found.</div>
        )}
      </div>
    </div>
  );
};

export default Home;
