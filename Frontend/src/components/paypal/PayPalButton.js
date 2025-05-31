import React, { useState } from 'react';
import axios from 'axios';

// Static function to log out from PayPal
export const logoutFromPayPal = () => {
  // Clear PayPal related data from localStorage
  localStorage.removeItem('paypalPaymentId');
  
  // Create an invisible iframe to load PayPal logout URL
  const paypalLogoutIframe = document.createElement('iframe');
  paypalLogoutIframe.style.display = 'none';
  paypalLogoutIframe.src = 'https://www.paypal.com/signout';
  document.body.appendChild(paypalLogoutIframe);
  
  // Remove the iframe after it has loaded
  paypalLogoutIframe.onload = () => {
    setTimeout(() => {
      document.body.removeChild(paypalLogoutIframe);
    }, 1000);
  };
};

const PayPalButton = ({ total, customerId, addressId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayPalPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend to create PayPal payment
      const response = await axios.post(
        `http://localhost:8080/api/paypal/create?customerId=${customerId}&addressId=${addressId}`
      );
      
      // Redirect to PayPal for payment
      if (response.data && response.data.redirectUrl) {
        // Store paymentId in localStorage for later use
        localStorage.setItem('paypalPaymentId', response.data.paymentId);
        // Redirect to PayPal
        window.location.href = response.data.redirectUrl;
      } else {
        setError('Failed to initiate PayPal payment');
      }
    } catch (err) {
      console.error('Error initiating PayPal payment:', err);
      setError(err.response?.data || 'Error initiating PayPal payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paypal-button-container">
      {error && <div className="paypal-error">{error}</div>}
      <button 
        className="paypal-button" 
        onClick={initiatePayPalPayment}
        disabled={loading}
      >
        {loading ? (
          <span>Processing...</span>
        ) : (
          <>
            <span className="paypal-logo">Pay</span>
            <span className="paypal-logo-pal">Pal</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PayPalButton;
