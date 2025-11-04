import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const API_BASE = 'http://localhost:8080/api/v1';

const AdminPage = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  const [customers, setCustomers] = useState([]);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [pendingShopkeepers, setPendingShopkeepers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------- Data Fetch -----------------
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchAllData();
  }, [token, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCustomers(),
        fetchShopkeepers(),
        fetchPendingShopkeepers(),
        fetchOrders()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchShopkeepers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/shopkeepers`);
      setShopkeepers(res.data);
    } catch (err) {
      console.error('Error fetching shopkeepers:', err);
    }
  };

  const fetchPendingShopkeepers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/pending-shopkeepers`);
      setPendingShopkeepers(res.data);
    } catch (err) {
      console.error('Error fetching pending shopkeepers:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/all`);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // ----------------- Action Handlers -----------------
  const handleApproveShopkeeper = async (id) => {
    try {
      await axios.post(`${API_BASE}/admin/approve-shopkeeper/${id}`);
      await Promise.all([fetchPendingShopkeepers(), fetchShopkeepers()]);
    } catch (err) {
      console.error('Error approving shopkeeper:', err);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE}/orders/${orderId}/status`,
        null,
        { params: { status: newStatus } }
      );
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE}/orders/${orderId}/payment-status`,
        null,
        { params: { paymentStatus: newStatus } }
      );
      fetchOrders();
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div>Loading...</div>;

  // ----------------- JSX -----------------
  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <img
          src={`${API_BASE}/admin/qr`}
          alt="Admin QR"
          className="admin-qr-image"
          onClick={() => setSelectedImage(`${API_BASE}/admin/qr`)}
        />
        <h1>Admin Dashboard</h1>
      </div>

      {/* Quick Navigation Buttons */}
      <div className="top-buttons-fixed">
        <button onClick={() => scrollToSection('orders')}>Orders ({orders.length})</button>
        <button onClick={() => scrollToSection('pending-shopkeepers')}>
          Pending Shopkeepers ({pendingShopkeepers.length})
        </button>
        <button onClick={() => scrollToSection('shopkeepers')}>
          Shopkeepers ({shopkeepers.length})
        </button>
        <button onClick={() => scrollToSection('customers')}>
          Customers ({customers.length})
        </button>
      </div>

      <div className="content-sections">
        {/* Orders Section */}
        <section id="orders">
          <h2>Orders (Total: {orders.length})</h2>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                {/* <th>Payment Screenshot</th> */}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={o.id}>
                  <td>{idx + 1}</td>
                  <td>{o.id}</td>
                  <td>{o.userId}</td>
                  <td>{o.orderDate}</td>
                  <td>{o.totalAmount}</td>
                  <td>
                    <select
                      value={o.orderStatus}
                      onChange={(e) =>
                        handleOrderStatusChange(o.id, e.target.value)
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={o.paymentStatus}
                      onChange={(e) =>
                        handlePaymentStatusChange(o.id, e.target.value)
                      }
                    >
                      <option value="DONE">DONE</option>
                      <option value="UNPAID">UNPAID</option>
                    </select>
                  </td>
                  {/* <td>
                    {o.paymentScreenshotUrl ? (
                      <img
                        src={`${API_BASE}/orders/payment/${o.id}`}
                        alt="Payment"
                        className="qr-image"
                        onClick={() =>
                          setSelectedImage(`${API_BASE}/orders/payment/${o.id}`)
                        }
                      />
                    ) : (
                      'No Screenshot'
                    )}
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Pending Shopkeepers */}
        <section id="pending-shopkeepers">
          <h2>Pending Shopkeepers (Total: {pendingShopkeepers.length})</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Shop Name</th>
                <th>Business QR</th>
                <th>Approve</th>
              </tr>
            </thead>
            <tbody>
              {pendingShopkeepers.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.shopName}</td>
                  <td>
                    {s.businessQR ? (
                      <img
                        src={`${API_BASE}/shopQR/${s.id}/qr`}
                        alt="QR"
                        className="shopkeeper-qr"
                        onClick={() =>
                          setSelectedImage(`${API_BASE}/shopQR/${s.id}/qr`)
                        }
                      />
                    ) : (
                      'No QR'
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleApproveShopkeeper(s.id)}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Shopkeepers Section */}
        <section id="shopkeepers">
          <h2>Shopkeepers (Total: {shopkeepers.length})</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Shop Name</th>
                <th>PAN</th>
                <th>Address</th>
                <th>Business QR</th>
              </tr>
            </thead>
            <tbody>
              {shopkeepers.map((s, idx) => (
                <tr key={s.id}>
                  <td>{idx + 1}</td>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.contactNumber}</td>
                  <td>{s.shopName}</td>
                  <td>{s.panNumber}</td>
                  <td>{s.address}</td>
                  <td>
                    <img
                      src={`${API_BASE}/shopQR/${s.id}/qr`}
                      alt="QR"
                      className="shopkeeper-qr"
                      onClick={() =>
                        setSelectedImage(`${API_BASE}/shopQR/${s.id}/qr`)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Customers Section */}
        <section id="customers">
          <h2>Customers (Total: {customers.length})</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={c.id}>
                  <td>{idx + 1}</td>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.contactNumber}</td>
                  <td>{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Large" className="modal-image" />
        </div>
      )}
    </div>
  );
};

export default AdminPage;
