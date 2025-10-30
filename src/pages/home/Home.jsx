import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import Login from "../../Auth/Login";
import Signup from "../../Auth/Signup";

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

  const [activeForm, setActiveForm] = useState(null); // "login" | "signup" | null
  const [selectedProduct, setSelectedProduct] = useState(null); // For modal
  const formRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${PRODUCTS_API}/all`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Server error: ${response.status}`);

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
      setCategories([...new Set(processedProducts.map((p) => p.category?.name).filter(Boolean))]);
      setBrands([...new Set(processedProducts.map((p) => p.brand).filter(Boolean))]);
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
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "" || product.category?.name === selectedCategory;
    const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Click outside for forms
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setActiveForm(null);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedProduct(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="home-page p-4 relative">
      {/* Login/Signup buttons */}
      {!activeForm && (
        <div className="flex justify-center gap-4 mb-4">
          <button className="btn-login" onClick={() => setActiveForm("login")}>Login</button>
          <button className="btn-signup" onClick={() => setActiveForm("signup")}>Signup</button>
        </div>
      )}

      {/* Filters */}
      <div className="filters flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border rounded p-2">
          <option value="">All Categories</option>
          {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
        </select>
        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="border rounded p-2">
          <option value="">All Brands</option>
          {brands.map((brand) => (<option key={brand} value={brand}>{brand}</option>))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="product-grid grid grid-cols-1 md:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card border rounded p-4 flex flex-col cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              {product.images && product.images[0] ? (
                <img src={product.images[0].viewUrl} alt={product.name} className="product-image w-full h-48 object-cover mb-2" />
              ) : (
                <div className="no-image bg-gray-200 w-full h-48 flex items-center justify-center mb-2">No Image</div>
              )}
              <h3>{product.name}</h3>
              <p className="brand text-gray-600">{product.brand}</p>
              <p className="price font-bold">Rs.{product.price?.toFixed(2)}</p>
            </div>
          ))
        ) : (
          <div>No products found.</div>
        )}
      </div>

      {/* Floating form panel */}
      {activeForm && (
        <div className="floating-form" ref={formRef}>
          {activeForm === "login" && <Login />}
          {activeForm === "signup" && <Signup />}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="product-details-modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-auto py-8">
          <div className="modal-content bg-white p-6 rounded max-w-4xl w-full relative" ref={modalRef}>
            <button className="close-modal absolute top-2 right-2 text-2xl font-bold" onClick={() => setSelectedProduct(null)}>
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="brand text-gray-700 mb-1">{selectedProduct.brand}</p>
            <p className="price font-semibold mb-4">Rs.{selectedProduct.price?.toFixed(2)}</p>

            <div className="product-images-gallery flex gap-4 mb-4 overflow-x-auto">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                selectedProduct.images.map((image, idx) => (
                  <img key={idx} src={image.viewUrl} alt={`${selectedProduct.name} ${idx + 1}`} className="w-32 h-32 object-cover cursor-pointer" onClick={() => window.open(image.downloadUrl, "_blank")} />
                ))
              ) : (
                <div className="no-image">No Images Available</div>
              )}
            </div>

            <div className="product-specs">
              <h3 className="font-semibold mb-2">Details</h3>
              <p>{selectedProduct.description || "No detailed description available."}</p>
              {selectedProduct.specifications && (
                <ul className="list-disc list-inside mt-2">
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
