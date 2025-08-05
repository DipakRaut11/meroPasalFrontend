import { useEffect, useState } from 'react';
import { fetchAllProducts } from '../api/productService';

const useProducts = (token) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchAllProducts(token);
        
        // Handle if data is returned as { products: [...] } instead of [...]
       // const productList = Array.isArray(data) ? data : data.products || [];
        const productList = Array.isArray(data.data) ? data.data : [];

        setProducts(productList);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getProducts();
    } else {
      setLoading(false);
      setError('No token provided');
    }
  }, [token]);

  return { products, setProducts, loading, error };
};

export default useProducts;
