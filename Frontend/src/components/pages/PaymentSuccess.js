import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faShoppingBag, faHome, faBoxOpen, faMapMarkerAlt, faCalendarAlt, faMoneyBill, faReceipt } from '@fortawesome/free-solid-svg-icons';
import '../../styles/PaymentPage.css';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setCartItems } = useContext(CartContext);

  useEffect(() => {
    // Prevent duplicate API calls
    if (paymentProcessed) {
      return;
    }
    
    const completePayment = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(location.search);
        
        // Parse all possible parameter variations
        const paymentId = params.get('paymentId') || params.get('token');
        const payerId = params.get('PayerID') || params.get('payerId');
        const customerId = params.get('customerId');
        const addressId = params.get('addressId');

        console.log('URL parameters:', location.search);
        console.log('Parsed parameters:', { paymentId, payerId, customerId, addressId });
        
        // Check if we have the required parameters
        if (!customerId || !addressId) {
          throw new Error(`Missing customer or address ID: customerId=${customerId}, addressId=${addressId}`);
        }
        
        // If we're missing PayPal parameters, show an error
        if (!paymentId) {
          throw new Error('Missing PayPal payment ID. Payment cannot be completed.');
        }
        
        if (!payerId) {
          throw new Error('Missing PayPal Payer ID. Payment cannot be completed.');
        }
        
        // Convert string IDs to numbers for backend
        const customerIdNum = parseInt(customerId, 10);
        const addressIdNum = parseInt(addressId, 10);

        console.log('Completing PayPal payment with:', { paymentId, payerId, customerId, addressId });

        try {
          // Check local storage for existing order details to avoid duplicate API calls
          const storedOrderDetails = localStorage.getItem('lastCompletedOrder');
          if (storedOrderDetails) {
            const parsedOrder = JSON.parse(storedOrderDetails);
            // Check if this is the same payment ID
            if (parsedOrder.paymentId === paymentId) {
              console.log('Found existing order details in local storage:', parsedOrder);
              setOrderDetails(parsedOrder.order);
              setPaymentProcessed(true);
              setLoading(false);
              return;
            }
          }
          
          // Call backend to complete payment - use the full, correct URL
          console.log('Sending request to backend with params:', {
            paymentId,
            PayerID: payerId,
            customerId: customerIdNum,
            addressId: addressIdNum
          });
          
          const response = await axios.post(
            'http://localhost:8080/api/paypal/complete',
            {},  // Empty body instead of null
            {
              params: {
                paymentId: paymentId,
                PayerID: payerId,
                customerId: customerIdNum,
                addressId: addressIdNum
              }
            }
          );
          
          console.log('Payment completed successfully:', response.data);
          setOrderDetails(response.data.order);
          
          // Store order details in local storage to prevent duplicate processing
          localStorage.setItem('lastCompletedOrder', JSON.stringify({
            paymentId,
            order: response.data.order,
            timestamp: new Date().toISOString()
          }));
          
          // Clear cart items after successful payment
          setCartItems([]);
          
          // Mark payment as processed to prevent duplicate calls
          setPaymentProcessed(true);
          setLoading(false);
        } catch (err) {
          console.error('Error completing payment:', err.response ? err.response.data : err.message);
          
          // Check if this is a "Cart is empty" error, which likely means payment was already processed
          if (err.response && err.response.data && err.response.data.includes('Cart is empty')) {
            console.log('Cart is empty error - payment likely already processed');
            
            // Try to fetch order details from backend using the payment ID
            try {
              const orderResponse = await axios.get(`http://localhost:8080/api/orders/by-payment/${paymentId}`);
              if (orderResponse.data) {
                setOrderDetails(orderResponse.data);
                setPaymentProcessed(true);
                setLoading(false);
                return;
              }
            } catch (orderErr) {
              console.error('Failed to fetch order by payment ID:', orderErr);
            }
            
            // If we can't get the order details, show a generic success message
            setOrderDetails({
              id: 'unknown',
              total: 'See order history',
              items: [],
              status: 'COMPLETED',
              paymentMethod: 'PAYPAL',
              transactionId: paymentId
            });
            setPaymentProcessed(true);
            setLoading(false);
            return;
          }
          
          setError(err.response ? `${err.response.status} ${err.response.statusText}: ${JSON.stringify(err.response.data)}` : err.message);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error completing payment:', err);
        setError(err.message || 'Failed to complete payment');
        setLoading(false);
      }
    };

    completePayment();
  }, [location.search, setCartItems, paymentProcessed]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card">
          <h2>Processing Payment</h2>
          <div className="loader"></div>
          <p>Please wait while we complete your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card error">
          <h2>Payment Failed</h2>
          <div className="error-icon">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <p className="error-message">{error}</p>
          <div className="action-buttons">
            <button className="primary-button" onClick={() => navigate('/cart')}>
              <FontAwesomeIcon icon={faShoppingBag} /> Return to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="payment-result-card success">
        <h2>Payment Successful!</h2>
        <div className="success-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        
        {orderDetails && (
          <div className="order-details">
            <h3>
              <FontAwesomeIcon icon={faReceipt} /> Order Details
            </h3>
            
            <div className="order-info-grid">
              <div className="order-info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faReceipt} /> Order ID:
                </span>
                <span className="info-value">{orderDetails.id}</span>
              </div>
              
              <div className="order-info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faMoneyBill} /> Total Amount:
                </span>
                <span className="info-value">${orderDetails.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="order-info-item">
                <span className="info-label">
                  <FontAwesomeIcon icon={faCalendarAlt} /> Order Date:
                </span>
                <span className="info-value">{new Date(orderDetails.orderDate).toLocaleString()}</span>
              </div>
            </div>
            
            <h4>
              <FontAwesomeIcon icon={faBoxOpen} /> Items
            </h4>
            <ul className="order-items-list">
              {orderDetails.orderItems.map(item => (
                <li key={item.id}>
                  <span className="item-name">{item.product.name} x {item.quantity}</span>
                  <span className="item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            
            <h4>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Shipping Address
            </h4>
            <p className="shipping-address">
              {orderDetails.shippingAddress.street}, {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}, {orderDetails.shippingAddress.country}
            </p>
          </div>
        )}
        
        <div className="action-buttons">
          <button className="primary-button" onClick={handleContinueShopping}>
            <FontAwesomeIcon icon={faHome} /> Continue Shopping
          </button>
          <Link to="/orders" className="secondary-button">
            <FontAwesomeIcon icon={faBoxOpen} /> View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
