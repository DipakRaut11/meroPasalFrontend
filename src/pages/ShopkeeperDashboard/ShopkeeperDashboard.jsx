import React, { useState } from 'react';
import useProducts from '../../hooks/useProducts';
import { addProduct, updateProduct, deleteProduct } from '../../api/productService';
import { uploadImages, deleteImage } from '../../api/imageService';

// Import ProductTable (choose matching import style)
import ProductTable from '../../components/products/ProductTable'; // If using default export
// OR
// import { ProductTable } from '../../components/products/ProductTable'; // If using named export

import ProductForm from '../../components/products/ProductForm';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { SearchBar } from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Corrected import

const ShopkeeperDashboard = () => {
  const token = localStorage.getItem('token');
  const { products, loading, error, setProducts } = useProducts(token);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    brand: '',
    category: ''
  });

  const handleAddProduct = async (productData, images) => {
    try {
      const newProduct = await addProduct(productData, token);
      console.log(newProduct); // Debugging line to check the response
  
      if (newProduct && newProduct.id && images.length > 0) {
        await uploadImages(newProduct.id, images, token);
      } else {
        console.log('No product ID returned, skipping image upload');
      }
  
      setProducts(prev => [...prev, newProduct]);
      setShowForm(false);
    } catch (err) {
      console.error('Add product error:', err);
    }
  };
  

  const handleUpdateProduct = async (productData, images) => {
    try {
      // Use the original ID for image upload, as the update response might not contain it
      const originalProductId = editingProduct.id; 
      const updatedProduct = await updateProduct(originalProductId, productData, token);
      if (images.length > 0) {
        // Pass the original ID to uploadImages
        await uploadImages(originalProductId, images, token); 
      }
      // Update the state - assume updatedProduct contains the latest data *except* maybe the ID
      // If the backend doesn't return the full updated object, we might need to merge
      // For now, let's assume it returns enough data for the UI update, or we fetch again later.
      setProducts(prev => 
        prev.map(p => p.id === originalProductId ? { ...p, ...productData, id: originalProductId } : p) // Merge data manually if needed
      );
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Update product error:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id, token);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // // Ensure products is an array before filtering
  // const filteredProducts = Array.isArray(products) ? products.filter(product => {
  //   return (
  //     product.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
  //     product.brand.toLowerCase().includes(searchFilters.brand.toLowerCase()) &&
  //     (product.category?.name || '').toLowerCase().includes(searchFilters.category.toLowerCase())
  //   );
  // }) : []; // Default to empty array if products is not an array

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const name = (product.name ?? '').toLowerCase();
    const brand = (product.brand ?? '').toLowerCase();
    const category = (product.category?.name ?? '').toLowerCase();
  
    return (
      name.includes(searchFilters.name.toLowerCase()) &&
      brand.includes(searchFilters.brand.toLowerCase()) &&
      category.includes(searchFilters.category.toLowerCase())
    );
  }) : [];
  

  if (loading) return <LoadingSpinner />;

  return (
    <div className="shopkeeper-dashboard">
      <h2>Shopkeeper Dashboard</h2>
      <ErrorMessage message={error} />
      
      <SearchBar 
        filters={searchFilters}
        onFilterChange={setSearchFilters}
      />
      
      <button 
        className="add-product-btn"
        onClick={() => {
          setEditingProduct(null);
          setShowForm(!showForm);
        }}
      >
        {showForm ? 'Cancel' : 'Add New Product'}
      </button>
      
      {showForm && (
        <ProductForm
          initialData={editingProduct || {}}
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          isEditing={!!editingProduct}
        />
      )}
      
      <ProductTable 
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onImageDelete={(productId, imageId) => {
          deleteImage(imageId, token)
            .then(() => {
              setProducts(prev => 
                prev.map(p => 
                  p.id === productId 
                    ? { ...p, images: p.images.filter(img => img.id !== imageId) }
                    : p
                )
              );
            });
        }}
      />
    </div>
  );
};

export default ShopkeeperDashboard;
