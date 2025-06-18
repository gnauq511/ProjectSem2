import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill, faCheck } from '@fortawesome/free-solid-svg-icons';
import { faCcPaypal } from '@fortawesome/free-brands-svg-icons';
import axios from 'axios';
import { CartContext } from '../../App';
import '../../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { showAlert } = useAlert();
  const { setCartItems } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const { items: selectedItems } = location.state || { items: [] };

  const [processingOrder, setProcessingOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    state: '',
    address: '',
    apt: '',
    city: '',
    zipCode: '',
    notes: ''
  });
  const [saveInfo] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null); // To handle order creation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedItems.length === 0) {
      showAlert('No items to checkout. Redirecting to cart.', 'error');
      navigate('/cart');
    }
  }, [selectedItems, navigate, showAlert]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.customerId) {
          console.log('Customer ID found in localStorage:', userData.customerId);
          setCustomerId(userData.customerId);
        } else {
          console.log('No customerId found in localStorage user data.');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId) return;
    console.log(`Fetching details for customerId: ${customerId}`);
    try {
      const response = await axios.get(`http://localhost:8080/api/customers/${customerId}`);
      console.log('API response from /api/customers:', response.data);
      const { user, addresses } = response.data;
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      }));
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0];
        setShippingInfo(prev => ({
          ...prev,
          country: defaultAddress.country || '',
          state: defaultAddress.state || '',
          address: defaultAddress.street || '',
          city: defaultAddress.city || '',
          zipCode: defaultAddress.zipCode || ''
        }));
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId, fetchCustomerDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!shippingInfo.firstName) newErrors.firstName = 'First name is required.';
    if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required.';
    if (!shippingInfo.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!shippingInfo.phoneNumber) newErrors.phoneNumber = 'Phone number is required.';
    if (!shippingInfo.address) newErrors.address = 'Address is required.';
    if (!shippingInfo.city) newErrors.city = 'City is required.';
    if (!shippingInfo.state) newErrors.state = 'State is required.';
    if (!shippingInfo.country) newErrors.country = 'Country is required.';
    if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCODTransactionId = () => {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 10000);
    return `COD_${timestamp}_${randomNum}`;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return; // Stop checkout if validation fails
    }
    setProcessingOrder(true);
    setLoading(true);

    let addressIdToUse = selectedAddressId;

    // If saveInfo is checked or no address was pre-loaded, save/update the address
    if (saveInfo || !selectedAddressId) {
      try {
        const addressData = {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country
        };
        const response = await axios.post(`http://localhost:8080/api/checkout/${customerId}/address`, addressData);
        addressIdToUse = response.data.id;
      } catch (error) {
        console.error('Error saving address:', error);
        showAlert('Failed to save shipping address.', 'error');
        setProcessingOrder(false);
        setLoading(false);
        return;
      }
    }

    if (!addressIdToUse) {
      showAlert('Could not determine a shipping address. Please fill out the form.', 'error');
      setProcessingOrder(false);
      setLoading(false);
      return;
    }

    try {
      if (paymentMethod === 'PAYPAL') {
        const response = await axios.post(`http://localhost:8080/api/paypal/create?customerId=${customerId}&addressId=${addressIdToUse}`);
        if (response.data && response.data.redirectUrl) {
          localStorage.setItem('paypalPaymentId', response.data.paymentId);
          window.location.href = response.data.redirectUrl;
        } else {
          throw new Error('Failed to initiate PayPal payment');
        }
      } else {
        const orderRequest = {
          customerId,
          addressId: addressIdToUse,
          paymentMethod: 'CASH_ON_DELIVERY',
          transactionId: generateCODTransactionId(),
          cartItems: selectedItems.map(item => ({ id: item.productId, name: item.name, price: item.price, quantity: item.quantity, image: item.image, size: item.size })),
          totalAmount: total,
        };
        const response = await axios.post('http://localhost:8080/api/orders/create', orderRequest);
        if (response.data) {
          setCartItems([]);
          navigate(`/payment-success?method=cod&orderId=${response.data.id}`);
        } else {
          throw new Error('Failed to create COD order');
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      showAlert(error.response?.data?.message || 'An error occurred during checkout.', 'error');
    } finally {
      setProcessingOrder(false);
      setLoading(false);
    }
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const total = subtotal;

  const formatPrice = (price) => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (selectedItems.length === 0) return null;

  return (
    <div className="checkout-page-container">
      <h1 className="page-title">Your bag ({selectedItems.length} items)</h1>
      <div className="checkout-main-content">
        <div className="shipping-address-container">
          <h2>Shipping address</h2>
          <form className="shipping-form">
            <div className="form-row">
              <div className="form-group half-width"><label>First name <span className="required-star">*</span></label><input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} className={errors.firstName ? 'input-error' : ''} /></div>
              <div className="form-group half-width"><label>Last name <span className="required-star">*</span></label><input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} className={errors.lastName ? 'input-error' : ''} /></div>
            </div>
            <div className="form-group"><label>Email <span className="required-star">*</span></label><input type="email" name="email" value={shippingInfo.email} onChange={handleInputChange} className={errors.email ? 'input-error' : ''} /></div>
            <div className="form-group"><label>Phone number <span className="required-star">*</span></label><input type="tel" name="phoneNumber" value={shippingInfo.phoneNumber} onChange={handleInputChange} className={errors.phoneNumber ? 'input-error' : ''} /></div>
            <div className="form-row">
              <div className="form-group half-width"><label>Country/Region <span className="required-star">*</span></label><input type="text" name="country" value={shippingInfo.country} onChange={handleInputChange} className={errors.country ? 'input-error' : ''} /></div>
              <div class="form-group half-width"><label>Provenance/State <span className="required-star">*</span></label><input type="text" name="state" value={shippingInfo.state} onChange={handleInputChange} className={errors.state ? 'input-error' : ''} /></div>
            </div>
            <div class="form-group"><label>Address <span className="required-star">*</span></label><input type="text" name="address" placeholder="Street address or P.O Box" value={shippingInfo.address} onChange={handleInputChange} className={errors.address ? 'input-error' : ''} /></div>
            <div className="form-group"><input type="text" name="apt" placeholder="Apt, unit, building, floor, etc." value={shippingInfo.apt} onChange={handleInputChange} /></div>
            <div className="form-row">
              <div className="form-group half-width"><label>City <span className="required-star">*</span></label><input type="text" name="city" value={shippingInfo.city} onChange={handleInputChange} className={errors.city ? 'input-error' : ''} /></div>
              <div class="form-group half-width"><label>ZIP / Postal code <span className="required-star">*</span></label><input type="text" name="zipCode" value={shippingInfo.zipCode} onChange={handleInputChange} className={errors.zipCode ? 'input-error' : ''} /></div>
            </div>
          </form>
        </div>
        <div className="order-summary-container">
          <div className="payment-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <div className={`payment-option ${paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}`} onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}>
                <FontAwesomeIcon icon={faMoneyBill} />
                <span>Cash on Delivery</span>
                {paymentMethod === 'CASH_ON_DELIVERY' && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
              </div>
              <div className={`payment-option ${paymentMethod === 'PAYPAL' ? 'selected' : ''}`} onClick={() => setPaymentMethod('PAYPAL')}>
                <FontAwesomeIcon icon={faCcPaypal} />
                <span>PayPal</span>
                {paymentMethod === 'PAYPAL' && <FontAwesomeIcon icon={faCheck} className="check-icon" />}
              </div>
            </div>
          </div>
          <div className="summary-card">
            {selectedItems.map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.image} alt={item.name} className="summary-item-image" />
                <div className="summary-item-details">
                  <span>{item.name}</span>
                </div>
                <span className="summary-item-price">${formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="price-breakdown">
              <div className="price-line"><p>Subtotal</p><p>${formatPrice(subtotal)}</p></div>  
            </div>
            <div className="total-line">
              <p>Total</p>
              <p>${formatPrice(total)}</p>
            </div>
            <button className="pay-button" onClick={handleCheckout} disabled={processingOrder || loading}>
              {loading ? 'Processing...' : `Pay $${formatPrice(total)}`}
            </button>
            <p className="terms-text">By clicking the button, you agree to the Terms of Service as well as the Terms of Sale</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

