import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../App';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, 
  faSpinner,
  faExclamationCircle,
  faMapMarkerAlt,
  faTruck
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/OrdersPage.css';

const OrdersPage = () => {
  const { currentUser } = useContext(CartContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Processing');

  const tabs = [
    { name: 'Processing', statuses: ['PENDING', 'PROCESSING'] },
    { name: 'On Shipping', statuses: ['SHIPPING'] },
    { name: 'Completed', statuses: ['DELIVERED'] },
    { name: 'Canceled', statuses: ['CANCELLED'] },
  ];

  useEffect(() => {
    if (!currentUser || !currentUser.customerId) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/customer/${currentUser.customerId}`);
        const sortedOrders = response.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sortedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  const getOrderCountForTab = (tabName) => {
    const tab = tabs.find(t => t.name === tabName);
    if (!tab) return 0;
    return orders.filter(order => tab.statuses.includes(order.status)).length;
  };

  const getFilteredOrders = () => {
    const currentTab = tabs.find(tab => tab.name === activeTab);
    return currentTab ? orders.filter(order => currentTab.statuses.includes(order.status)) : [];
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return '$ 0';
    return `$${price.toLocaleString('id-ID')}`;
  };

  const renderOrderStatusTag = (status) => {
    let text = 'On Process';
    let className = 'on-process';

    if (status === 'SHIPPING') {
        text = 'On Deliver';
        className = 'on-deliver';
    } else if (status === 'DELIVERED') {
        text = 'Completed';
        className = 'Completed';
    } else if (status === 'CANCELLED') {
        text = 'Canceled';
        className = 'canceled';
    }

    return <div className={`order-status-tag ${className}`}>{text}</div>;
  };

  if (loading) {
    return (
      <div className="orders-page-container loading">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page-container error">
        <FontAwesomeIcon icon={faExclamationCircle} size="3x" />
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/login" className="btn-link">Login</Link>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="orders-page-container">
      <h1 className="orders-main-title">My Orders</h1>
      
      <div className="order-tabs">
        {tabs.map(tab => (
          <button
            key={tab.name}
            className={`tab-btn ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
            <span className="order-count">{getOrderCountForTab(tab.name)}</span>
          </button>
        ))}
      </div>

      <div className="orders-list-new">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card-new">
              <div className="order-card-header">
                <div className="card-header-left">
                  <FontAwesomeIcon icon={faShoppingBag} />
                  <span className="order-id-new">CTH-{order.id}</span>
                </div>
                {renderOrderStatusTag(order.status)}
              </div>

              {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && (
                <div className="shipping-progress-bar">
                    <FontAwesomeIcon icon={faTruck} className="truck-icon"/>
                    <span className="location-start">Ha Noi, Viet Nam</span>
                    <div className="progress-dots"></div>
                    <span className="est-arrival">{order.status === 'DELIVERED' ? `Order Completed: ${new Date(order.completedDate || order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : `Estimated arrival: ${new Date(new Date(order.orderDate).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}</span>
                    <div className="progress-dots"></div>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon"/>
                    <span className="location-end">{order.address?.city||'Your House'}, {order.address?.country || 'N/A'}</span>
                </div>
              )}

              <div className="order-items-list-new">
                {order.orderItems.map(item => (
                  <div key={item.id} className="order-item-new">
                    <img src={item.product.image} alt={item.product.name} className="item-image-new" onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder.png' }} />
                    <div className="item-info-new">
                      <p className="item-name-new">{item.product.name}</p>
                      <p className="item-price-new">{formatPrice(item.price)} x{item.quantity}</p>
                      <p className="item-size-new">Size: {item.size}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <p className="total-price-new">Total: <span>{formatPrice(order.totalAmount)}</span></p>
                <div className="footer-buttons">
                  {order.status === 'DELIVERED' && (
                    <button className="review-button" onClick={() => navigate(`/feedback/${order.id}`)}>Review</button>
                  )}
                  <button className="details-button" onClick={() => navigate(`/order/${order.id}`)}>Details</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders-found">
            <FontAwesomeIcon icon={faShoppingBag} size="3x" />
            <p>No orders found in this category.</p>
            {orders.length === 0 && 
              <Link to="/collection" className="btn-link">Shop Now</Link>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

