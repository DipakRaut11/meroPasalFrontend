import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const AdminPage = () => {
  const [customers, setCustomers] = useState([]);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [pendingShopkeepers, setPendingShopkeepers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    // Redirect to login if admin not authenticated
    if (!token) {
      navigate('/login');
      return;
    }

    // Set authorization header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    fetchAllData();
  }, [token, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCustomers(),
      fetchShopkeepers(),
      fetchPendingShopkeepers(),
      fetchOrders()
    ]);
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/admin/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchShopkeepers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/admin/shopkeepers');
      setShopkeepers(response.data);
    } catch (error) {
      console.error('Error fetching shopkeepers:', error);
    }
  };

  const fetchPendingShopkeepers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/admin/pending-shopkeepers');
      setPendingShopkeepers(response.data);
    } catch (error) {
      console.error('Error fetching pending shopkeepers:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/orders/all');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/v1/admin/approve-shopkeeper/${id}`);
      fetchPendingShopkeepers();
      fetchShopkeepers();
    } catch (error) {
      console.error('Error approving shopkeeper:', error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/v1/orders/${orderId}/payment-status`,
        null,
        { params: { paymentStatus: newStatus } }
      );
      fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <img
          src="http://localhost:8080/api/v1/admin/qr"
          alt="Admin QR"
          className="admin-qr-image"
          onClick={() => setSelectedImage("http://localhost:8080/api/v1/admin/qr")}
        />
        <h1>Admin Dashboard</h1>
      </div>

      <div className="top-buttons-fixed">
        <button onClick={() => scrollToSection('orders')}>Orders ({orders.length})</button>
        <button onClick={() => scrollToSection('pending-shopkeepers')}>Pending Shopkeepers ({pendingShopkeepers.length})</button>
        <button onClick={() => scrollToSection('shopkeepers')}>Shopkeepers ({shopkeepers.length})</button>
        <button onClick={() => scrollToSection('customers')}>Customers ({customers.length})</button>
      </div>

      <div className="content-sections">
        {/* Orders Section */}
        <section id="orders">
          <h2>Orders (Total: {orders.length})</h2>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Payment Screenshot</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, index) => (
                <tr key={o.id}>
                  <td>{index + 1}</td>
                  <td>{o.id}</td>
                  <td>{o.userId}</td>
                  <td>{o.orderDate}</td>
                  <td>{o.totalAmount}</td>
                  <td>{o.orderStatus}</td>
                  <td>
                    <select
                      value={o.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(o.id, e.target.value)}
                    >
                      <option value="DONE">DONE</option>
                      <option value="UNPAID">UNPAID</option>
                    </select>
                  </td>
                  <td>
                    {o.paymentScreenshotUrl ? (
                      <img
                        src={`http://localhost:8080/api/v1/orders/payment/${o.id}`}
                        alt="Payment"
                        className="qr-image"
                        onClick={() => setSelectedImage(`http://localhost:8080/api/v1/orders/payment/${o.id}`)}
                      />
                    ) : "No Screenshot"}
                  </td>
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
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Shop Name</th>
                <th>Business QR</th>
                <th>Approve</th>
              </tr>
            </thead>
            <tbody>
              {pendingShopkeepers.map((s, index) => (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.shopName}</td>
                  <td>
                    {s.businessQR ? (
                      <img
                        src={`http://localhost:8080/api/v1/shopQR/${s.id}/qr`}
                        alt="QR"
                        className="shopkeeper-qr"
                        onClick={() => setSelectedImage(`http://localhost:8080/api/v1/shopQR/${s.id}/qr`)}
                      />
                    ) : 'No QR'}
                  </td>
                  <td>
                    <button onClick={() => handleApprove(s.id)}>Approve</button>
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
                <th>S.No</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Shop Name</th>
                <th>PAN Number</th>
                <th>Address</th>
                <th>Business QR</th>
              </tr>
            </thead>
            <tbody>
              {shopkeepers.map((s, index) => (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.contactNumber}</td>
                  <td>{s.shopName}</td>
                  <td>{s.panNumber}</td>
                  <td>{s.address}</td>
                  <td>
                    <img
                      src={`http://localhost:8080/api/v1/shopQR/${s.id}/qr`}
                      alt="QR"
                      className="shopkeeper-qr"
                      onClick={() => setSelectedImage(`http://localhost:8080/api/v1/shopQR/${s.id}/qr`)}
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
                <th>S.No</th>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, index) => (
                <tr key={c.id}>
                  <td>{index + 1}</td>
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

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Large" className="modal-image" />
        </div>
      )}
    </div>
  );
};

export default AdminPage;
