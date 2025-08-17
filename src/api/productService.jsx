import { API_BASE } from '../utils/constants';

const PRODUCTS_API = `${API_BASE}/products`;

// Fetch all products
export const fetchAllProducts = async (token = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${PRODUCTS_API}/shopkeeper/all`, { headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch products');
  }
  return response.json();
};

// Fetch image as Blob
export const fetchImageBlob = async (imageId, token) => {
  const response = await fetch(`${API_BASE}/images/view/${imageId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch image');
  }
  return response.blob();
};

// Convert image Blob to Object URL
export const getImageObjectUrl = async (imageId, token) => {
  const blob = await fetchImageBlob(imageId, token);
  return URL.createObjectURL(blob);
};

// Fetch image IDs by product
export const fetchImageIdsByProductId = async (productId, token) => {
  const response = await fetch(`${API_BASE}/image/images/download/${productId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch image metadata');
  }
  return response.json();
};

// Combine products with first image
export const fetchProductsWithImages = async (token) => {
  const products = await fetchAllProducts(token);

  const productsWithImages = await Promise.all(
    products.map(async (product) => {
      try {
        const images = await fetchImageIdsByProductId(product.id, token);
        const firstImageId = images?.[0]?.id;
        const imageUrl = firstImageId ? await getImageObjectUrl(firstImageId, token) : null;
        return { ...product, imageUrl, images };
      } catch (err) {
        console.error(`Error fetching image for product ${product.id}:`, err.message);
        return { ...product, imageUrl: null, images: [] };
      }
    })
  );

  return productsWithImages;
};

// ✅ Add new product
export const addProduct = async (productData) => {
  const token = sessionStorage.getItem('token');
  const shopkeeperId = sessionStorage.getItem('shopkeeperId');

  // Normalize category to object if string
  let categoryObj;
  if (typeof productData.category === 'string') {
    categoryObj = { name: productData.category };
  } else if (productData.category?.name) {
    categoryObj = { name: productData.category.name };
  } else {
    categoryObj = null;
  }

  const payload = {
    name: productData.name,
    brand: productData.brand,
    price: productData.price,
    inventory: productData.inventory,
    description: productData.description,
    category: categoryObj,
    shopkeeper: shopkeeperId ? { id: parseInt(shopkeeperId, 10) } : null
  };

  if (
    !payload.name ||
    !payload.brand ||
    !payload.price ||
    !payload.inventory ||
    !payload.description ||
    !payload.category?.name 
    
  ) {
    throw new Error('Missing required product information');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const response = await fetch(`${PRODUCTS_API}/add`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add product');
  }

  return response.json();
};

// Update product
export const updateProduct = async (id, productData, token) => {
  const payload = {
    name: productData.name,
    brand: productData.brand,
    price: productData.price,
    inventory: productData.inventory,
    description: productData.description,
    category: typeof productData.category === 'string'
      ? { name: productData.category }
      : { id: productData.categoryId }
  };

  const response = await fetch(`${PRODUCTS_API}/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }

  return response.json();
};


// Fetch product by ID
export const getProductById = async (id, token) => {
  const response = await fetch(`${PRODUCTS_API}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch product by ID');
  }

  return response.json(); // returns the product object
};


// Delete product
export const deleteProduct = async (id, token) => {
  const response = await fetch(`${PRODUCTS_API}/delete/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }

  return response.json();
};
