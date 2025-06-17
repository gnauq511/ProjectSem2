import React, { useEffect, useState, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../App';
import axios from 'axios';
import '../../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const paymentProcessed = useRef(false);
  const { setCartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const completeOrder = async () => {
      if (paymentProcessed.current) {
        return;
      }
      paymentProcessed.current = true;

      try {
        const params = new URLSearchParams(location.search);
        const paymentMethod = params.get('method'); // 'paypal' or 'cod'

        if (paymentMethod === 'paypal') {
          const paymentId = params.get('paymentId');
          const PayerID = params.get('PayerID') || params.get('payerId');
          const customerId = params.get('customerId');
          const addressId = params.get('addressId');

          if (!paymentId || !PayerID || !customerId || !addressId) {
            setError('Missing required PayPal payment parameters');
            setLoading(false);
            return;
          }

          // Complete PayPal payment on backend
          const response = await axios.post(
            'http://localhost:8080/api/paypal/complete',
            null,
            {
              params: {
                paymentId,
                PayerID,
                customerId,
                addressId,
              },
            }
          );
          setOrderDetails(response.data.order);

        } else if (paymentMethod === 'cod') {
          const orderId = params.get('orderId');
          if (!orderId) {
            setError('Missing required COD order ID');
            setLoading(false);
            return;
          }

          // Fetch COD order details from backend
          const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`);
          setOrderDetails(response.data);

        } else {
          setError('Unknown payment method or missing parameters');
          setLoading(false);
          return;
        }

        // Clear cart for both successful PayPal and COD orders
        setCartItems([]);
        setLoading(false);

      } catch (err) {
        console.error('Error completing order or fetching details:', err);
        setError(err.response?.data || 'An error occurred.');
        setLoading(false);
      }
    };

    completeOrder();
  }, [location.search, setCartItems]);

  return (
    <div className="payment-success-page">
        {loading ? (
          <div className="payment-loading">
            <h2>Processing your order...</h2>
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div className="payment-error">
            <h2>Order Error</h2>
            <p>{error || "An unexpected error occurred while processing your order."}</p>
            <button onClick={() => navigate('/cart')} className="return-button">
              Return to Cart
            </button>
          </div>
        ) : (
          <div className="success-card">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <h2>Order Successful!</h2>
            <p className="thank-you-message">Thank you for your purchase. Your order has been successfully processed.</p>
            {orderDetails && (
              <div className="order-summary">
                <p><strong>Order ID:</strong> <span>{orderDetails.id}</span></p>
                <p><strong>Total Amount:</strong> <span>${orderDetails.totalAmount?.toFixed(2)}</span></p>
                <p><strong>Date:</strong> <span>{new Date(orderDetails.orderDate).toLocaleString()}</span></p>
              </div>
            )}
            <div className="card-footer">
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                Continue Shopping
              </button>
              <button onClick={() => navigate('/orders')} className="btn btn-primary">
                View My Orders
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default PaymentSuccess;
