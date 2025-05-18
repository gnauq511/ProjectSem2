import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CartItem from '../common/CartItem';
import { CartContext } from '../../App';
import '../../styles/CartPage.css';

const CartPage = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [processingOrder, setProcessingOrder] = useState(false);
  
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
  
  // Handle checkout
  const handleCheckout = () => {
    const selected = cartItems.filter(item => item.selected);
    if (selected.length === 0) {
      alert("Please select products to checkout!");
    } else {
      setProcessingOrder(true);
      
      // Simulate processing time
      setTimeout(() => {
        alert(`Order successful! Total: ₫${total.toLocaleString()}`);
        
        // Remove checked out items from cart
        setCartItems(prev => prev.filter(item => !item.selected));
        setProcessingOrder(false);
      }, 1500);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <FontAwesomeIcon icon={faShoppingCart} /> Shopping Cart
          </h1>
          <Link to="/" className="continue-shopping">
            <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some items to your cart to see them here.</p>
            <Link to="/" className="btn brown-bg">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <CartItem key={item.id} item={item} />
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
                <label htmlFor="select-all" className="checkbox-label"></label>
                <span>Select All</span>
              </div>

              <div className="order-summary">
                <p className="summary-text">
                  Total ({selectedCount} {selectedCount === 1 ? 'item' : 'items'}):{" "}
                  <strong className="total-price">₫{total.toLocaleString()}</strong>
                </p>
                <button 
                  onClick={handleCheckout} 
                  className="checkout-btn"
                  disabled={selectedCount === 0 || processingOrder}
                >
                  {processingOrder ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage; 