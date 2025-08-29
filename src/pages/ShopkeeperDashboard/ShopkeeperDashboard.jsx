// src/pages/ShopkeeperDashboard/ShopkeeperDashboard.jsx
import React, { useState, useEffect } from 'react';
import useProducts from '../../hooks/useProducts';
import { addProduct, updateProduct, deleteProduct } from '../../api/productService';
import { uploadImages, deleteImage } from '../../api/imageService';
import { getShopOrders, updateOrderStatus } from '../../api/orderService';
import ProductTable from '../../components/products/ProductTable';
import ProductForm from '../../components/products/ProductForm';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { SearchBar } from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ShopkeeperDashboard.css';

// Define order statuses as constants to avoid hardcoding
const ORDER_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

const ShopkeeperDashboard = () => {
  const token = sessionStorage.getItem('token');
  const shopkeeperId = sessionStorage.getItem('shopkeeperId');

  // Tabs: 'products' or 'orders'
  const [activeTab, setActiveTab] = useState('products');

  /** PRODUCT STATE **/
  const { products, loading: productsLoading, error: productsError, setProducts } = useProducts(token);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchFilters, setSearchFilters] = useState({ name: '', brand: '', category: '' });

  /** ORDER STATE **/
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');

      const res = await getShopOrders(token);
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setOrdersError('Failed to fetch orders');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status, token);
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, orderStatus: status } : o)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  /** PRODUCT HANDLERS **/
  const handleAddProduct = async (productData, images) => {
    try {
  
      if (!productData.name || !productData.brand || !productData.price || !productData.inventory || !productData.category) {
        throw new Error('Please fill in all required fields');
      }

      const payload = {
        name: productData.name,
        brand: productData.brand,
        price: productData.price.toString(),
        inventory: parseInt(productData.inventory, 10),
        description: productData.description,
        category: { name: productData.category },
        shopkeeper: { id: parseInt(shopkeeperId, 10) }
      };

      const newProduct = await addProduct(payload);
      if (newProduct?.data?.id && images.length > 0) {
        await uploadImages(newProduct.data.id, images, token);
      }
      setProducts(prev => [...prev, newProduct.data]);
      setShowForm(false);
    } catch (err) {
      console.error('Add product error:', err.message);
    }
  };

  const handleUpdateProduct = async (productData, images) => {
    try {
      const originalProductId = editingProduct.id;
      const payload = {
        name: productData.name,
        brand: productData.brand,
        price: productData.price.toString(),
        inventory: parseInt(productData.inventory, 10),
        description: productData.description,
        category: { name: productData.category }
      };
      await updateProduct(originalProductId, payload, token);
      if (images.length > 0) {
        await uploadImages(originalProductId, images, token);
      }
      setProducts(prev =>
        prev.map(p => (p.id === originalProductId ? { ...p, ...payload, id: originalProductId } : p))
      );
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Update product error:', err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id, token);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete product error:', err.message);
      const backendMessage = err.response?.data?.message || err.message;
      alert(backendMessage);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  /** FILTERED PRODUCTS **/
  const filteredProducts = Array.isArray(products)
    ? products.filter(product => {
        const name = (product.name ?? '').toLowerCase();
        const brand = (product.brand ?? '').toLowerCase();
        const category = (product.category?.name ?? '').toLowerCase();
        return (
          name.includes(searchFilters.name.toLowerCase()) &&
          brand.includes(searchFilters.brand.toLowerCase()) &&
          category.includes(searchFilters.category.toLowerCase())
        );
      })
    : [];

  /** LOADING STATE **/
  if (productsLoading && activeTab === 'products') return <LoadingSpinner />;
  if (ordersLoading && activeTab === 'orders') return <LoadingSpinner />;

  return (
    <div className="shopkeeper-dashboard">
      <h2>Shopkeeper Dashboard</h2>

      {/* Tab Switcher */}
      <div className="tab-buttons">
        <button onClick={() => setActiveTab('products')} className={activeTab === 'products' ? 'active' : ''}>
          Products
        </button>
        <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'active' : ''}>
          Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <ErrorMessage message={productsError} />
          <SearchBar filters={searchFilters} onFilterChange={setSearchFilters} />
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
              deleteImage(imageId, token).then(() => {
                setProducts(prev =>
                  prev.map(p =>
                    p.id === productId ? { ...p, images: p.images.filter(img => img.id !== imageId) } : p
                  )
                );
              });
            }}
          />
        </>
      )}

      {activeTab === 'orders' && (
        <>
          {ordersError && <p>{ordersError}</p>}
          {(orders || []).length === 0 ? (
            <p>No orders found for your shop.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {(orders || []).map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.userName || order.userId}</td>
                    <td>
                      {(order.items || []).map(item => (
                        <div key={item.productId}>
                          {item.productName} x {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td>{order.totalAmount}</td>
                    <td>{order.orderStatus}</td>
                    <td>{order.paymentStatus}</td>
                    <td>
                      <select
                        value={order.orderStatus || ORDER_STATUSES.PENDING}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                      >
                        {Object.values(ORDER_STATUSES).map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default ShopkeeperDashboard;