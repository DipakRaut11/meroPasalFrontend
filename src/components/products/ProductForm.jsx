import React, { useState } from 'react';
import ImageUploader from '../../components/images/ImageUploader';
import './ProductForm.css';

const ProductForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    brand: initialData.brand || '',
    price: initialData.price || '',
    inventory: initialData.inventory || '',
    description: initialData.description || '',
    category: initialData.category?.name || initialData.category || ''
  });

  const [selectedImages, setSelectedImages] = useState(initialData.images || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
     console.log("Form submitted", formData, selectedImages);
    onSubmit(formData, selectedImages);
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label>Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Brand</label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Price</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Inventory</label>
        <input
          type="number"
          name="inventory"
          value={formData.inventory}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
      </div>

      <ImageUploader
        onImagesChange={setSelectedImages}
        initialImages={initialData.images || []}
      />

      <div className="form-actions">
        <button type="submit">
          {isEditing ? 'Update Product' : 'Add Product'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
