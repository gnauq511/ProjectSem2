import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../styles/OrderDetailPage.css'; // We will create this file later

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(CartContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, currentUser, navigate]);

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '$ 0';
    return `$${price.toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <div className="order-detail-container loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading Order Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container error">
        <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/orders" className="btn-link">Back to Orders</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container error">
        <h2>Order Not Found</h2>
        <p>The requested order could not be found.</p>
        <Link to="/orders" className="btn-link">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <button onClick={() => navigate('/orders')} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to My Orders
      </button>
      <h1 className="order-detail-title">Order Details</h1>
      <div className="order-detail-card">
        <div className="order-detail-header">
          <div>
            <p><strong>Order ID:</strong> CTH-{order.id}</p>
            <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p><strong>Status:</strong> <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></p>
            <p><strong>Total:</strong> <span className="total-amount">{formatPrice(order.totalAmount)}</span></p>
          </div>
        </div>
        <div className="order-detail-body">
          <h3>Items Ordered</h3>
          <div className="order-items-list">
            {order.orderItems.map(item => (
              <div key={item.id} className="order-item-detail">
                <img src={item.product.image} alt={item.product.name} className="item-image-detail" onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png' }} />
                <div className="item-info-detail">
                  <p className="item-name-detail">{item.product.name}</p>
                  <p className="item-variation">Variation: {item.size}</p>
                  <p className="item-quantity">x{item.quantity}</p>
                </div>
                <p className="item-price-detail">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>

          <div className="order-summary-section">
            <div className="summary-row">
              <span>Total Amount</span>
              <span className="summary-total-amount">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>

          <h3>Shipping Address</h3>
          <div className="shipping-address">
            <p>{order.address.street}, {order.address.city}</p>
            <p>{order.address.state}, {order.address.zipCode}</p>
            <p>{order.address.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
