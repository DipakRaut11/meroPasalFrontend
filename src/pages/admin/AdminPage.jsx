import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
    const [customers, setCustomers] = useState([]);
    const [shopkeepers, setShopkeepers] = useState([]);
    const [pendingShopkeepers, setPendingShopkeepers] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchCustomers();
        fetchShopkeepers();
        fetchPendingShopkeepers();
    }, []);

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

    const handleApprove = async (id) => {
        try {
            await axios.post(`http://localhost:8080/api/v1/admin/approve-shopkeeper/${id}`);
            fetchPendingShopkeepers();
            fetchShopkeepers();
        } catch (error) {
            console.error('Error approving shopkeeper:', error);
        }
    };

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>

            {/* Customers Table */}
            <section>
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

            {/* Shopkeepers Table */}
            <section>
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
                                        className="qr-image"
                                        onClick={() =>
                                            setSelectedImage(`http://localhost:8080/api/v1/shopQR/${s.id}/qr`)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Pending Shopkeepers Table */}
            <section>
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
                                            className="qr-image"
                                            onClick={() =>
                                                setSelectedImage(`http://localhost:8080/api/v1/shopQR/${s.id}/qr`)
                                            }
                                        />
                                    ) : (
                                        'No QR'
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleApprove(s.id)}>Approve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Image Modal */}
            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="QR Large" className="modal-image" />
                </div>
            )}
        </div>
    );
};

export default AdminPage;
