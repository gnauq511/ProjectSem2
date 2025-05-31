import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PaymentPage.css';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-cancel">
          <div className="cancel-icon">✕</div>
          <h2>Payment Cancelled</h2>
          <p>Your payment process has been cancelled.</p>
          <p>No charges have been made to your account.</p>
          <div className="action-buttons">
            <button onClick={() => navigate('/cart')} className="return-button">
              Return to Cart
            </button>
            <button onClick={() => navigate('/')} className="continue-shopping-button">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
