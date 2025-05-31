import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../App';
import axios from 'axios';
import '../../styles/PaymentPage.css';

const PaymentSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const { setCartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const completePayment = async () => {
      try {
        // Get query parameters
        const params = new URLSearchParams(location.search);
        const paymentId = params.get('paymentId');
        const PayerID = params.get('PayerID');
        const customerId = params.get('customerId');
        const addressId = params.get('addressId');
        
        if (!paymentId || !PayerID || !customerId || !addressId) {
          setError('Missing required payment parameters');
          setLoading(false);
          return;
        }
        
        // Complete payment on backend
        const response = await axios.post(
          'http://localhost:8080/api/paypal/complete',
          null,
          {
            params: {
              paymentId,
              PayerID,
              customerId,
              addressId
            }
          }
        );
        
        // Set order details
        setOrderDetails(response.data.order);
        
        // Clear cart
        setCartItems([]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error completing payment:', err);
        setError(err.response?.data || 'Error completing payment');
        setLoading(false);
      }
    };
    
    completePayment();
  }, [location.search, setCartItems]);

  return (
    <div className="payment-page">
      <div className="payment-container">
        {loading ? (
          <div className="payment-loading">
            <h2>Processing your payment...</h2>
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div className="payment-error">
            <h2>Payment Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/cart')} className="return-button">
              Return to Cart
            </button>
          </div>
        ) : (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            {orderDetails && (
              <div className="order-details">
                <p><strong>Order ID:</strong> {orderDetails.id}</p>
                <p><strong>Total Amount:</strong> ${orderDetails.totalAmount?.toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
              </div>
            )}
            <p>Thank you for your purchase. Your order has been successfully processed.</p>
            <div className="action-buttons">
              <button onClick={() => navigate('/')} className="continue-shopping-button">
                Continue Shopping
              </button>
              <button onClick={() => navigate('/orders')} className="view-orders-button">
                View My Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
