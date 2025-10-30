// Example in ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8080/api/v1";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/products/product/${id}`)  // <-- singular 'product' here
      .then(res => {
        setProduct(res.data.data); // your ApiResponse wraps actual product in `data`
      })
      .catch(err => {
        console.error("Product fetch error:", err);
      });
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.brand}</p>
      <p>Rs.{product.price}</p>
      {/* show images, etc */}
    </div>
  );
};

export default ProductDetail;
