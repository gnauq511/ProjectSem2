import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../App';
import OrderService from '../../services/OrderService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faTimes, 
  faInfoCircle, 
  faCalendarAlt, 
  faMoneyBillWave, 
  faMapMarkerAlt, 
  faBoxOpen,
  faSpinner,
  faExclamationCircle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/OrdersPage.css';

const OrdersPage = () => {
  const { currentUser } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser || !currentUser.customerId) {
        setError('Please login to view your orders');
        setLoading(false);
        return;
      }

      try {
        const data = await OrderService.getOrdersByCustomerId(currentUser.customerId);
        // Sort orders by date (newest first)
        const sortedOrders = data.sort((a, b) => 
          new Date(b.orderDate) - new Date(a.orderDate)
        );
        setOrders(sortedOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const [cancelError, setCancelError] = useState(null);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrderId(orderId);
    setCancelError(null);
    
    try {
      await OrderService.cancelOrder(orderId);
      
      // Update the order status in the local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'CANCELLED' } : order
      ));
      
      // Show success message using state instead of direct DOM manipulation
      setSuccessMessage('Order cancelled successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error cancelling order:', err);
      
      // Set specific error message based on the error
      if (err.response) {
        if (err.response.status === 400) {
          setCancelError('Cannot cancel this order. It may already be processed or delivered.');
        } else if (err.response.status === 404) {
          setCancelError('Order not found. It may have been deleted or never existed.');
        } else {
          setCancelError(`Server error (${err.response.status}). Please try again later.`);
        }
      } else if (err.request) {
        setCancelError('Network error. Please check your connection and try again.');
      } else {
        setCancelError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setCancellingOrderId(null);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    // Reset cancel error when toggling order details
    setCancelError(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'status-delivered';
      case 'SHIPPED':
        return 'status-shipped';
      case 'PROCESSING':
        return 'status-processing';
      case 'PENDING':
        return 'status-pending';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'CANCELLED':
        return <FontAwesomeIcon icon={faTimes} />;
      case 'PROCESSING':
      case 'PENDING':
        return <FontAwesomeIcon icon={faSpinner} className="fa-spin" />;
      case 'SHIPPED':
        return <FontAwesomeIcon icon={faBoxOpen} />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} />;
    }
  };

  if (loading) {
    return (
      <div className="orders-container loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container error">
        <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/login" className="login-button">
          Login
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container empty">
        <FontAwesomeIcon icon={faShoppingBag} size="3x" />
        <h2>No Orders Found</h2>
        <p>You haven't placed any orders yet.</p>
        <Link to="/collection" className="shop-now-button">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-container">
      {successMessage && (
        <div className="cancel-success-message">
          <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
        </div>
      )}
      <h1 className="orders-title">
        <FontAwesomeIcon icon={faShoppingBag} /> My Orders
      </h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header" onClick={() => toggleOrderDetails(order.id)}>
              <div className="order-basic-info">
                <div className="order-id">
                  <span className="label">Order #:</span>
                  <span className="value">{order.id}</span>
                </div>
                <div className="order-date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(order.orderDate)}</span>
                </div>
              </div>
              
              <div className="order-status-price">
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusIcon(order.status)} {order.status}
                </div>
                <div className="order-total">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  <span>${order.totalAmount}</span>
                </div>
              </div>
            </div>
            
            {expandedOrderId === order.id && (
              <div className="order-details">
                <div className="order-address">
                  <h4><FontAwesomeIcon icon={faMapMarkerAlt} /> Shipping Address</h4>
                  <p>
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>
                
                <div className="order-items">
                  <h4><FontAwesomeIcon icon={faBoxOpen} /> Items</h4>
                  <ul>
                    {order.orderItems.map(item => (
                      <li key={item.id} className="order-item">
                        <div className="item-info">
                          <img 
                            src={item.product.image || 'https://via.placeholder.com/50'} 
                            alt={item.product.name} 
                            className="item-image"
                          />
                          <div className="item-details">
                            <span className="item-name">{item.product.name}</span>
                            <span className="item-quantity">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="item-price">${item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <div className="order-actions">
                    <button 
                      className="cancel-order-btn" 
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                    >
                      {cancellingOrderId === order.id ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin /> Cancelling...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faTimes} /> Cancel Order
                        </>
                      )}
                    </button>
                    {cancelError && order.id === cancellingOrderId && (
                      <div className="cancel-error">
                        <FontAwesomeIcon icon={faExclamationCircle} /> {cancelError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
