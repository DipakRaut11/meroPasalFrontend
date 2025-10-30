// src/components/products/ProductTable.jsx
import React from 'react';
import './ProductTable.css';

const ProductTable = ({ products, onEdit, onDelete, onImageDelete }) => {
  console.log("Products in ProductTable:", products);

  return (
    <div className="product-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.brand}</td>
              <td>Rs.{product.price}</td>
              <td>{product.inventory}</td>
              
              {/* IMAGES COLUMN */}
              <td>
                <div className="product-image-container">
                  {product.images && product.images.length > 0 ? (
                    <div className="product-image-grid">
                      {product.images.map((image, index) => {
                        console.log("Image object for product:", product.name, image); // ✅ See all fields
                        console.log("Image ID:", image.id); // ✅ Check if `id` exists

                        return(
                        <div key={index} className="product-thumbnail-wrapper">
                          <img
                            src={image.downloadUrl}
                            alt={product.name}
                            className="product-thumbnail"
                          />
                          <button
                            className="delete-image-btn"
                            onClick={() => onImageDelete(product.id, image.imageId)}
                          >
                            Delete
                          </button>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                </div>
              </td>

              {/* ACTIONS COLUMN */}
              <td>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => onEdit(product)}>Edit</button>
                  <button className="delete-btn" onClick={() => onDelete(product.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
