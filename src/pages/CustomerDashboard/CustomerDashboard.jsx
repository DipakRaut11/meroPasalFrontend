import React, { useEffect, useState } from 'react';
//import './CustomerDashboard.css';

const API_BASE = 'http://localhost:8080/api/v1';
const PRODUCTS_API = `${API_BASE}/products`;
const IMAGE_API = `${API_BASE}/image`;

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

      // Process products to ensure consistent image structure
      const processedProducts = Array.isArray(data) ? data : data.data || [];
      const normalizedProducts = processedProducts.map(product => ({
        ...product,
        images: product.images?.map(img => ({
          id: img.imageId || img.id,
          fileName: img.imageName || img.fileName,
          // Changed to use view endpoint instead of download
          viewUrl: `${IMAGE_API}/images/view/${img.imageId || img.id}`,
          downloadUrl: img.downloadUrl || `${IMAGE_API}/images/download/${img.imageId || img.id}`
        })) || []
      }));

      setProducts(normalizedProducts);
      
      // Extract unique categories and brands
      const uniqueCategories = [...new Set(processedProducts
        .map(p => p.category?.name)
        .filter(Boolean))];
      const uniqueBrands = [...new Set(processedProducts
        .map(p => p.brand)
        .filter(Boolean))];
      
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || 
      (product.category?.name === selectedCategory);
    
    const matchesBrand = selectedBrand === '' || 
      (product.brand === selectedBrand);
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleImageClick = (imageId) => {
    // Open image in new tab using the download endpoint
    window.open(`${IMAGE_API}/images/download/${imageId}`, '_blank');
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="customer-dashboard">
      <h2>Customer Dashboard</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select 
          value={selectedBrand} 
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              {product.images && product.images.length > 0 ? (
                <div className="product-image-container">
                  <img 
                    src={product.images[0].viewUrl} 
                    alt={product.name} 
                    className="product-image"
                    onClick={() => handleImageClick(product.images[0].id)}
                  />
                  {product.images.length > 1 && (
                    <div className="image-count-badge">
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-image-placeholder">No Image Available</div>
              )}
              
              <div className="product-info">
                <h3>{product.name || 'Unnamed Product'}</h3>
                <p className="brand">{product.brand || 'No Brand'}</p>
                <p className="price">${product.price?.toFixed(2) || '0.00'}</p>
                <p className="description">
                  {product.description?.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description || 'No description available'}
                </p>
                <button 
                  className="view-details" 
                  onClick={() => handleViewDetails(product)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products-message">
            No products found matching your criteria.
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="product-details-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeProductDetails}>
              &times;
            </button>
            
            <h2>{selectedProduct.name}</h2>
            <p className="brand">{selectedProduct.brand}</p>
            <p className="price">${selectedProduct.price?.toFixed(2)}</p>
            
            <div className="product-images-gallery">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                selectedProduct.images.map((image, index) => (
                  <div key={index} className="gallery-image-container">
                    <img 
                      src={image.viewUrl} 
                      alt={`${selectedProduct.name} ${index + 1}`}
                      className="gallery-image"
                      onClick={() => handleImageClick(image.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="no-image-placeholder">No Images Available</div>
              )}
            </div>
            
            <div className="product-specs">
              <h3>Details</h3>
              <p>{selectedProduct.description || 'No detailed description available.'}</p>
              
              {selectedProduct.specifications && (
                <div className="specifications">
                  <h4>Specifications</h4>
                  <ul>
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

