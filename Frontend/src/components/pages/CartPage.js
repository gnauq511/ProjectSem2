import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CartItem from '../common/CartItem';
import { CartContext } from '../../App';
import axios from 'axios';
import { useAlert } from '../../contexts/AlertContext';
import '../../styles/CartPage.css';

const CartPage = () => {
  const { showAlert } = useAlert();
  const { cartItems, setCartItems } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/cart/${customerId}`);
      const fetchedItems = response.data.map(item => ({
        id: item.id, // This is cart_item_id
        productId: item.product.id,
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
      showAlert('Failed to load your cart. Please try refreshing the page.', 'error');
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

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setCartItems(prev =>
      prev.map(item => ({ ...item, selected: checked }))
    );
  };

  const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
  const selectedCount = cartItems.filter(item => item.selected).length;

  const handleProceedToCheckout = () => {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      showAlert("Please select products to checkout!", 'error');
    } else {
      navigate('/checkout', { state: { items: selectedItems } });
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

  const formatPrice = (price) => {
    if (typeof price === 'string') {
        price = parseInt(price.replace(/\D/g, ''), 10);
    }
    return price.toLocaleString('en-US');
  };

  return (
    <div className="cart-page-container">
      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <FontAwesomeIcon icon={faShoppingCart} /> Shopping Cart
          </h1>
          <Link to="/" className="continue-shopping-link">
            <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
          </Link>
        </div>

        {loading ? (
          <p>Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart to see them here.</p>
            <Link to="/" className="btn brown-bg">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onSizeChange={handleSizeChange}
                />
              ))}
            </div>
            <div className="cart-footer">
              <div className="select-all-container">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
                <label htmlFor="select-all">Select All ({selectedCount})</label>
              </div>
              <div className="total-price-container">
                <span className="total-label">Total:</span>
                <span className="total-price">${formatPrice(total)}</span>
              </div>
              <button
                className="btn brown-bg checkout-btn"
                onClick={handleProceedToCheckout}
              >
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
