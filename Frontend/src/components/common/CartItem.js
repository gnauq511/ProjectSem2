import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from '../../App';
import '../../styles/CartItem.css';

const CartItem = ({ item }) => {
  const { toggleSelected, updateQuantity, removeFromCart } = useContext(CartContext);
  
  // Format price to currency
  const formatPrice = (price) => {
    // Handle both string and number formats
    const numPrice = typeof price === 'string' 
      ? parseInt(price.replace(/\D/g, ''))
      : price;
      
    return numPrice.toLocaleString();
  };
  
  // Calculate item total
  const itemTotal = item.quantity * (
    typeof item.price === 'string' 
      ? parseInt(item.price.replace(/\D/g, ''))
      : item.price
  );

  return (
    <div className="cart-item">
      <div className="cart-item-select">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => toggleSelected(item.id)}
          className="cart-checkbox"
          id={`item-${item.id}`}
        />
        <label htmlFor={`item-${item.id}`} className="checkbox-label"></label>
      </div>

      <div className="cart-item-image">
        <img 
          src={item.image.startsWith('/') ? item.image : `/${item.image}`} 
          alt={item.name} 
          className="cart-img" 
        />
      </div>

      <div className="cart-item-details">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-price">₫{formatPrice(item.price)}</p>
      </div>

      <div className="quantity-control">
        <button 
          className="quantity-btn" 
          onClick={() => updateQuantity(item.id, -1)}
          aria-label="Decrease quantity"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
        <span className="quantity-value">{item.quantity}</span>
        <button 
          className="quantity-btn" 
          onClick={() => updateQuantity(item.id, 1)}
          aria-label="Increase quantity"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <div className="cart-item-total">
        <p className="item-total">₫{formatPrice(itemTotal)}</p>
      </div>  

      <button 
        className="delete-btn" 
        onClick={() => removeFromCart(item.id)}
        aria-label="Remove item"
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>  
    </div>
  );
};

export default CartItem; 