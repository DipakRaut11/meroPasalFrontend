// src/images/ImageUploader.jsx

import React from 'react';

const ImageUploader = ({ onImagesChange, initialImages = [] }) => {
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    onImagesChange(files);
  };

  return (
    <div className="image-uploader">
      <input 
        type="file" 
        multiple 
        onChange={handleImageChange}
      />
      <div className="preview">
        {initialImages.map((img, idx) => (
          <img key={idx} src={img} alt={`Preview ${idx}`} width={100} />
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
