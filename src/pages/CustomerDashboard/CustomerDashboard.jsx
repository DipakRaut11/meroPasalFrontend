// src/pages/CustomerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext"; // ensure correct path

// Import React Router elements to add navigation to Cart page
import { Link } from "react-router-dom"; 

const API_BASE = "http://localhost:8080/api/v1";
const PRODUCTS_API = `${API_BASE}/products`;
const IMAGE_API = `${API_BASE}/image`;

const CustomerDashboard = () => {
  // ... your existing state & hooks
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addItem } = useCart(); // cart actions

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${PRODUCTS_API}/all`);
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
      (product.name &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand &&
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "" || product.category?.name === selectedCategory;

    const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleImageClick = (imageId) => {
    window.open(`${IMAGE_API}/images/download/${imageId}`, "_blank");
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="customer-dashboard p-4">
      <h2 className="text-2xl font-bold mb-4">Customer Dashboard</h2>

      {/* Add a link/button to navigate to Cart page */}
      {/* =========== CART PAGE LINK ========== */}
      <div className="mb-4">
        <Link
          to="/cart" // This assumes you have a Route for CartPage at /cart
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Cart
        </Link>
      </div>
      {/* ===================================== */}

      {error && <div className="error-message text-red-600 mb-4">{error}</div>}

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
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card border rounded p-4 flex flex-col"
            >
              {product.images && product.images.length > 0 ? (
                <div className="product-image-container mb-4">
                  <img
                    src={product.images[0].viewUrl}
                    alt={product.name}
                    className="product-image w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleImageClick(product.images[0].id)}
                  />
                  {product.images.length > 1 && (
                    <div className="image-count-badge absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 rounded text-sm">
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-image-placeholder bg-gray-200 w-full h-48 flex items-center justify-center mb-4">
                  No Image Available
                </div>
              )}

              <div className="product-info flex-grow">
                <h3 className="text-lg font-semibold">{product.name || "Unnamed Product"}</h3>
                <p className="brand text-gray-600">{product.brand || "No Brand"}</p>
                <p className="price font-bold mt-1">${product.price?.toFixed(2) || "0.00"}</p>
                <p className="description mt-2 text-sm text-gray-700">
                  {product.description?.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description || "No description available"}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="view-details flex-grow bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                  onClick={() => handleViewDetails(product)}
                >
                  View Details
                </button>

                <button
                  className="add-to-cart flex-grow bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => addItem(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products-message">No products found matching your criteria.</div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="product-details-modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="modal-content bg-white p-6 rounded max-w-4xl max-h-[90vh] overflow-auto relative">
            <button
              className="close-modal absolute top-2 right-2 text-2xl font-bold"
              onClick={closeProductDetails}
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="brand text-gray-700 mb-1">{selectedProduct.brand}</p>
            <p className="price font-semibold mb-4">${selectedProduct.price?.toFixed(2)}</p>

            <div className="product-images-gallery flex gap-4 mb-4 overflow-x-auto">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                selectedProduct.images.map((image, index) => (
                  <div key={index} className="gallery-image-container flex-shrink-0 w-32 h-32 border rounded overflow-hidden cursor-pointer">
                    <img
                      src={image.viewUrl}
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onClick={() => handleImageClick(image.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="no-image-placeholder">No Images Available</div>
              )}
            </div>

            <div className="product-specs">
              <h3 className="font-semibold mb-2">Details</h3>
              <p>{selectedProduct.description || "No detailed description available."}</p>

              {selectedProduct.specifications && (
                <div className="specifications mt-3">
                  <h4 className="font-semibold mb-1">Specifications</h4>
                  <ul className="list-disc list-inside">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
