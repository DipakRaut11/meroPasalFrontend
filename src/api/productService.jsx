import { API_BASE } from '../utils/constants';

const PRODUCTS_API = `${API_BASE}/products`;

export const fetchAllProducts = async (token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${PRODUCTS_API}/all`, { headers });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch products');
  }

  return response.json();
};

export const fetchImageBlob = async (imageId, token) => {
  const response = await fetch(`${API_BASE}/images/view/${imageId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch image');
  }

  return response.blob();
};

export const getImageObjectUrl = async (imageId, token) => {
  const blob = await fetchImageBlob(imageId, token);
  return URL.createObjectURL(blob);
};

// Fetch image IDs by product ID (you must have this endpoint on backend)
export const fetchImageIdsByProductId = async (productId, token) => {
  const response = await fetch(`${API_BASE}/image/images/download/${productId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch image metadata');
  }

  return response.json(); // should return array of image objects or IDs
};

// Combine products with images
export const fetchProductsWithImages = async (token) => {
  const products = await fetchAllProducts(token);

  const productsWithImages = await Promise.all(
    products.map(async (product) => {
      try {
        const images = await fetchImageIdsByProductId(product.id, token);

        // Assume the backend returns: [{ id: 6 }, { id: 7 }]
        const firstImageId = images?.[0]?.id;
        const imageUrl = firstImageId
          ? await getImageObjectUrl(firstImageId, token)
          : null;

        return { ...product, imageUrl };
      } catch (err) {
        console.error(`Error fetching image for product ${product.id}:`, err.message);
        return { ...product, imageUrl: null };
      }
    })
  );

  return productsWithImages;
};

export const addProduct = async (productData) => {
  const token = localStorage.getItem('token');

  if (!productData.name || !productData.brand || !productData.price || !productData.inventory || !productData.description || !productData.category) {
    throw new Error('Missing required product information');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }) // ✅ ONLY send if token exists
  };

  const response = await fetch(`${PRODUCTS_API}/add`, {
    method: 'POST',
    headers,
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add product');
  }

  return response.json();
};



// Update an existing product
export const updateProduct = async (id, productData, token) => {
  const response = await fetch(`${PRODUCTS_API}/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: productData.name,
      brand: productData.brand,
      price: productData.price,
      inventory: productData.inventory,
      description: productData.description,
      category: productData.category, // Ensure correct data for category
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }

  return response.json();
};

// Delete a product
export const deleteProduct = async (id, token) => {
  const response = await fetch(`${PRODUCTS_API}/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }

  return response.json();
};
