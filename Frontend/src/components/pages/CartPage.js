  import React, { useContext, useState, useEffect, useCallback } from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faShoppingCart, faArrowLeft, faPlus, faMoneyBill, faCheck } from '@fortawesome/free-solid-svg-icons';
  import { faCcPaypal } from '@fortawesome/free-brands-svg-icons';
  import CartItem from '../common/CartItem';
  import { CartContext } from '../../App';
  import axios from 'axios';
  import '../../styles/CartPage.css';
  import '../../styles/PayPalButton.css';

  const CartPage = () => {
    const { cartItems, setCartItems } = useContext(CartContext);

    const [processingOrder, setProcessingOrder] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
    const [newAddress, setNewAddress] = useState({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });

    const [customerId, setCustomerId] = useState(null);

    const navigate = useNavigate();

    const fetchCartItems = useCallback(async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/cart/${customerId}`);
        const fetchedItems = response.data.map(item => ({
          id: item.id, // This is cart_item_id
          productId: item.product.id, // This is the actual product_id
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          size: item.size,
          selected: true, // Default to selected
        }));
        setCartItems(fetchedItems);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        alert('Failed to load your cart. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }, [customerId, setCartItems]);

    useEffect(() => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.customerId) {
            setCustomerId(userData.customerId);
          } else {
            console.error('customerId not found in userData from localStorage');
          }
        } catch (error) {
          console.error('Error parsing currentUser from localStorage:', error);
        }
      } else {
        console.error('currentUser not found in localStorage');
      }
    }, []);

    useEffect(() => {
      if (customerId) {
        fetchCartItems();
      }
    }, [customerId, fetchCartItems]);

    // Calculate total price
    const calculateTotal = () => {
      return cartItems
        .filter(item => item.selected)
        .reduce((sum, item) => {
          const itemPrice = typeof item.price === 'string' 
            ? parseInt(item.price.replace(/\D/g, ''))
            : item.price;
          return sum + (item.quantity * itemPrice);
        }, 0);
    };

    const total = calculateTotal();

    // Handle select all
    const handleSelectAll = (e) => {
      const checked = e.target.checked;
      setCartItems(prev =>
        prev.map(item => ({ ...item, selected: checked }))
      );
    };

    // Are all items selected?
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

    // Number of selected items
    const selectedCount = cartItems.filter(item => item.selected).length;

    // Fetch customer addresses from the backend
    const fetchAddresses = useCallback(async () => {
      if (!customerId) return; // Don't fetch if customerId isn't loaded yet
      try {
        const response = await axios.get(`http://localhost:8080/api/checkout/${customerId}/addresses`);
        setAddresses(response.data);
        if (response.data.length > 0 && !selectedAddressId) { // Also check if selectedAddressId is not already set
          setSelectedAddressId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        alert('Failed to load addresses. Please try again.');
      }
    }, [customerId, selectedAddressId]); // Added selectedAddressId to prevent re-selecting if already set by user

    useEffect(() => {
      if (showCheckout && customerId) { // Ensure customerId is loaded before fetching
        fetchAddresses();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [showCheckout, customerId, fetchAddresses]); // fetchAddresses is now stable due to useCallback

    // Handle address form input changes
    const handleAddressChange = (e) => {
      const { name, value } = e.target;
      setNewAddress(prev => ({
        ...prev,
        [name]: value
      }));
    };

    // Payment method handling functions can be added here if needed

    // Handle adding a new address
    const handleAddAddress = async (e) => {
      e.preventDefault();
      try {
        setProcessingOrder(true);
        const response = await axios.post(
          `http://localhost:8080/api/checkout/${customerId}/address`,
          newAddress
        );
        
        // Add the new address to the list and select it
        setAddresses(prev => [...prev, response.data]);
        setSelectedAddressId(response.data.id);
        
        // Reset the form and hide it
        setNewAddress({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        });
        setShowAddressForm(false);
      } catch (error) {
        console.error('Error adding address:', error);
        alert('Failed to add address. Please try again.');
      } finally {
        setProcessingOrder(false);
      }
    };

    // Handle proceeding to checkout
    const handleProceedToCheckout = () => {
      const selected = cartItems.filter(item => item.selected);
      if (selected.length === 0) {
        alert("Please select products to checkout!");
      } else {
        setShowCheckout(true);
      }
    };

    // Generate a unique COD transaction ID
    const generateCODTransactionId = () => {
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 10000);
      return `COD_${timestamp}_${randomNum}`;
    };

    // Handle checkout for both payment methods
    const handleCheckout = async () => {
      if (!selectedAddressId) {
        alert('Please select a shipping address');
        return;
      }
      
      setProcessingOrder(true);
      
      try {
        if (paymentMethod === 'PAYPAL') {
          // For PayPal, initiate the PayPal payment flow
          try {
            setLoading(true); // Set loading state for PayPal payment initiation
            
            // Call backend to create PayPal payment
            const response = await axios.post(
              `http://localhost:8080/api/paypal/create?customerId=${customerId}&addressId=${selectedAddressId}`
            );
            
            // Redirect to PayPal for payment
            if (response.data && response.data.redirectUrl) {
              // Store paymentId in localStorage for later use
              localStorage.setItem('paypalPaymentId', response.data.paymentId);
              // Redirect to PayPal
              window.location.href = response.data.redirectUrl;
              return;
            } else {
              throw new Error('Failed to initiate PayPal payment');
            }
          } catch (err) {
            console.error('Error initiating PayPal payment:', err);
            alert(err.response?.data || 'Error initiating PayPal payment');
            setProcessingOrder(false);
            setLoading(false); // Reset loading state on error
            return;
          }
        } else {
          // Handle Cash on Delivery (COD)
          const selectedItems = cartItems.filter(item => item.selected);

          const orderRequest = {
            customerId,
            addressId: selectedAddressId,
            paymentMethod: 'CASH_ON_DELIVERY',
            transactionId: generateCODTransactionId(),
            cartItems: selectedItems.map(item => ({
              id: item.productId, // Use productId instead of item.id
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              size: item.size,
            })),
          };

          const response = await axios.post(
            'http://localhost:8080/api/orders/create',
            orderRequest
          );

          if (response.data) {
            console.log('COD order created successfully:', response.data);
            setTimeout(() => {
              setCartItems([]);
              navigate(`/payment-success?method=cod&orderId=${response.data.id}`);
            }, 1500);
          } else {
            throw new Error('Failed to create COD order');
          }
        }
      } catch (error) {
        console.error('Error during checkout:', error);
        const data = error.response?.data;
        const errorMessage = (data && typeof data === 'object' && data.message) ? data.message : data;
        alert(errorMessage || 'An error occurred during checkout.');
      } finally {
        setProcessingOrder(false);
        setLoading(false); 
      }
    };
    const handleSizeChange = (itemId, newSize) => {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, size: newSize } : item
        )
      );
    };
    const handleQuantityChange = (itemId, newQuantity) => {
      if (newQuantity <= 0) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      } else {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    };
    return (
      <div className="cart-page-container">
        <div className="cart-container">
          <div className="cart-header">
            <h1>
              <FontAwesomeIcon icon={faShoppingCart} /> Shopping Cart
            </h1>
            <Link to="/" className="continue-shopping-link">
              <>
                <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
              </>
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <h2>Your cart is empty</h2>
              <p>Add some items to your cart to see them here.</p>
              <Link to="/" className="btn brown-bg">Start Shopping</Link>
            </div>
          ) : showCheckout ? (
            <div className="checkout-container">
              <h2>Checkout</h2>
              
              <div className="checkout-section">
                <h3>Shipping Address</h3>
                
                {addresses.length > 0 && (
                  <div className="address-selection">
                    <select 
                      value={selectedAddressId} 
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="address-select"
                    >
                      {addresses.map(address => (
                        <option key={address.id} value={address.id}>
                          {address.street}, {address.city}, {address.state}, {address.zipCode}, {address.country}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {!showAddressForm ? (
                  <button 
                    className="add-address-btn" 
                    onClick={() => setShowAddressForm(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add New Address
                  </button>
                ) : (
                  <>
                  <form className="address-form" onSubmit={handleAddAddress}>
                    <div className="form-group">
                      <label>Street:</label>
                      <input 
                        type="text" 
                        name="street" 
                        value={newAddress.street} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>City:</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={newAddress.city} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>State:</label>
                      <input 
                        type="text" 
                        name="state" 
                        value={newAddress.state} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Zip Code:</label>
                      <input 
                        type="text" 
                        name="zipCode" 
                        value={newAddress.zipCode} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Country:</label>
                      <input 
                        type="text" 
                        name="country" 
                        value={newAddress.country} 
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    
                    <div className="form-buttons">
                      <button type="submit" className="save-address-btn">Save Address</button>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  </>
                )}
              </div>
              
              <div className="checkout-section payment-section">
                <h3>Select Payment Method</h3>
                <div className="payment-method-options">
                  <div 
                    className={`payment-method-option ${paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  >
                    <input 
                      type="radio" 
                      id="cash-on-delivery" 
                      name="payment-method" 
                      value="CASH_ON_DELIVERY" 
                      checked={paymentMethod === 'CASH_ON_DELIVERY'} 
                      onChange={() => setPaymentMethod('CASH_ON_DELIVERY')} 
                    />
                    <label htmlFor="cash-on-delivery">
                      <FontAwesomeIcon icon={faMoneyBill} className="payment-icon" />
                      Cash on Delivery
                    </label>
                  </div>
                  <div 
                    className={`payment-method-option ${paymentMethod === 'PAYPAL' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('PAYPAL')}
                  >
                    <input 
                      type="radio" 
                      id="paypal" 
                      name="payment-method" 
                      value="PAYPAL" 
                      checked={paymentMethod === 'PAYPAL'} 
                      onChange={() => setPaymentMethod('PAYPAL')} 
                    />
                    <label htmlFor="paypal">
                      <FontAwesomeIcon icon={faCcPaypal} className="payment-icon" />
                      PayPal
                    </label>
                  </div>
                </div>
                
                {/* Payment method details */}
                <div className="payment-details-container">
                  {paymentMethod === 'CASH_ON_DELIVERY' && (
                    <div className="payment-details cod-details">
                      <div className="payment-details-icon">
                        <FontAwesomeIcon icon={faMoneyBill} />
                      </div>
                      <div className="payment-details-content">
                        <h4>Cash on Delivery</h4>
                        <p>Pay with cash when your order is delivered to your doorstep.</p>
                        <ul className="payment-benefits">
                          <li><FontAwesomeIcon icon={faCheck} /> No online payment needed</li>
                          <li><FontAwesomeIcon icon={faCheck} /> Pay only when you receive your items</li>
                          <li><FontAwesomeIcon icon={faCheck} /> Available for all addresses</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'PAYPAL' && (
                    <div className="payment-details paypal-details">
                      <div className="payment-details-icon">
                        <FontAwesomeIcon icon={faCcPaypal} />
                      </div>
                      <div className="payment-details-content">
                        <h4>PayPal Secure Payment</h4>
                        <p>Complete your purchase securely with PayPal.</p>
                        <ul className="payment-benefits">
                          <li><FontAwesomeIcon icon={faCheck} /> Fast and secure payment</li>
                          <li><FontAwesomeIcon icon={faCheck} /> Protected by PayPal's buyer protection</li>
                          <li><FontAwesomeIcon icon={faCheck} /> No additional fees</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="checkout-section">
                <h3>Order Summary</h3>
                <div className="order-items">
                  {cartItems.filter(item => item.selected).map(item => (
                    <div key={item.id} className="order-item-summary">
                      <div className="order-item-details">
                        <span>{item.name} x {item.quantity}</span>
                        {item.size && <span className="order-item-size">Size: {item.size}</span>}
                      </div>
                      <span>${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="order-total">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="checkout-actions">
                <button 
                  onClick={() => setShowCheckout(false)} 
                  className="back-button"
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Back to Cart
                </button>
                <button 
                  onClick={handleCheckout} 
                  className="place-order-button"
                  disabled={processingOrder || loading || !selectedAddressId}
                >
                  {processingOrder || loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          ) : (
            <>
            <div className="cart-items">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onSizeChange={handleSizeChange}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
            <div className="cart-summary">
              <div className="select-all">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="cart-checkbox"
                />
                <label htmlFor="select-all">Select All</label>
              </div>
              <div className="cart-total">
                <p>
                  Total: <strong>${total.toLocaleString()}</strong>
                </p>
              </div>
              <button className="btn brown-bg" onClick={handleProceedToCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
