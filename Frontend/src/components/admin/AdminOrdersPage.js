import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import '../../styles/AdminOrdersPage.css';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Status options for dropdown
  const statusOptions = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders from API...');
        
        // Add a timestamp parameter to prevent caching
        const timestamp = new Date().getTime();
        const response = await axios.get(`http://localhost:8080/api/orders?_=${timestamp}`);
        
        console.log('API Response status:', response.status);
        console.log('Orders data:', response.data);
        
        if (Array.isArray(response.data)) {
          console.log(`Received ${response.data.length} orders`);
          
          // Sort orders by ID to ensure consistent display order
          const sortedOrders = [...response.data].sort((a, b) => {
            // Sort by ID in descending order (newest first)
            return b.id - a.id;
          });
          
          sortedOrders.forEach((order, index) => {
            console.log(`Order ${index + 1}:`, {
              id: order.id,
              customer: order.customer,
              status: order.status,
              totalAmount: order.totalAmount,
              orderDate: order.orderDate,
              orderItems: order.orderItems ? order.orderItems.length : 0,
              shippingAddress: order.shippingAddress ? 'Present' : 'Missing',
              payments: order.payments ? order.payments.length : 0
            });
          });
          
          setOrders(sortedOrders);
        } else {
          console.error('API did not return an array of orders:', response.data);
          setError('Received invalid data format from server');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(`Failed to load orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Send status as a plain string as expected by the backend
      await axios.patch(`http://localhost:8080/api/orders/${orderId}/status`, newStatus, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      console.log(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  // Toggle order details expansion
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Debug the orders data structure when available
  useEffect(() => {
    console.log('Orders data structure:', orders);
    // Check if orders are loaded but not displayed correctly
    if (orders && orders.length > 0) {
      console.log(`Displaying ${orders.length} orders with IDs:`, orders.map(order => order.id));
    }
  }, [orders]);

  if (loading) {
    return (
      <div className="admin-orders-page">
        <h1>Order Management</h1>
        <div className="loading">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-page">
        <h1>Order Management</h1>
        <div className="error">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <h1>
        <FontAwesomeIcon icon={faShoppingCart} /> Order Management
      </h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">No orders found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr className={expandedOrderId === order.id ? 'expanded' : ''}>
                  <td>{order.id}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    {order.customer ? 
                      `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || 'Unknown Customer' : 
                      'Unknown Customer'}
                  </td>
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td>
                    <select 
                      value={order.status || 'PENDING'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`status-${(order.status || 'pending').toLowerCase()}`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                {expandedOrderId === order.id && (
                  <tr className="order-details">
                    <td colSpan="6">
                      <div className="order-details-content">
                        <h3>Order Items</h3>
                        {order.orderItems && order.orderItems.length > 0 ? (
                          <table className="items-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Size</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.orderItems.map((item, index) => (
                                <tr key={item.id || index}>
                                  <td>{item.product?.name || 'Unknown Product'}</td>
                                  <td>{formatPrice(item.price || 0)}</td>
                                  <td>{item.quantity || 0}</td>
                                  <td>{item.size || 'N/A'}</td>
                                  <td>
                                    {formatPrice((item.price || 0) * (item.quantity || 0))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>No order items available</p>
                        )}
                        
                        <div className="order-address">
                          <h3>Shipping Address</h3>
                          {order.address ? (
                            <p>
                              {order.address.street || 'No street information'}<br />
                              {[
                                order.address.city, 
                                order.address.state, 
                                order.address.zipCode
                              ].filter(Boolean).join(', ') || 'No city/state information'}<br />
                              {order.address.country || 'No country information'}
                            </p>
                          ) : (
                            <p>No address information available</p>
                          )}
                        </div>
                        
                        <div className="order-payment">
                          <h3>Payment Information</h3>
                          {order.payments && order.payments.length > 0 ? (
                            <div>
                              <p><strong>Method:</strong> {order.payments[0].paymentMethod || 'N/A'}</p>
                              <p><strong>Status:</strong> {order.payments[0].status || 'N/A'}</p>
                              <p><strong>Transaction ID:</strong> {order.payments[0].transactionId || 'N/A'}</p>
                              <p><strong>Date:</strong> {formatDate(order.payments[0].paymentDate) || 'N/A'}</p>
                            </div>
                          ) : (
                            <p>No payment information available</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrdersPage;
