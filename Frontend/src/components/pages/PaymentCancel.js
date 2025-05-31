import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PaymentPage.css';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleReturnToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card cancel">
        <h2>Payment Cancelled</h2>
        <div className="cancel-icon">✕</div>
        <p>Your payment has been cancelled. No charges were made.</p>
        <button className="primary-button" onClick={handleReturnToCart}>
          Return to Cart
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;
