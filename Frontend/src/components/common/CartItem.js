import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from '../../App';
import '../../styles/CartItem.css';

// Available sizes (can be dynamic if needed)
const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

const CartItem = ({ item, onSizeChange, onQuantityChange }) => {
  const { toggleSelected, removeFromCart } = useContext(CartContext);

  // Get product data from item
  const product = item.product || {};
  const productName = item.name || product.name || 'Product';
  const productPrice = item.price || product.price || 0;
  const productImage = item.image || product.image || '/images/placeholder.png';
  const currentSize = item.size || availableSizes[0]; // Default to 'S' if no size set

  // Format price to currency
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string'
      ? parseInt(price.replace(/\D/g, ''))
      : price;
    return numPrice.toLocaleString();
  };

  // Calculate item total
  const itemTotal = item.quantity * (
    typeof productPrice === 'string'
      ? parseInt(productPrice.replace(/\D/g, ''))
      : productPrice
  );

  // Handle size change
  const handleSizeChange = (e) => {
    const newSize = e.target.value;
    onSizeChange(item.id, newSize);
  };

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
          src={
            productImage && productImage.startsWith('http')
              ? productImage
              : productImage && productImage.startsWith('/')
                ? productImage
                : `/${productImage}`
          }
          alt={productName}
          className="cart-img"
          onError={(e) => {
            e.target.src = '/images/placeholder.png';
            console.warn("Failed to load image:", productImage);
          }}
        />
      </div>

      <div className="cart-item-details">
        <h3 className="product-name">{productName}</h3>
        <p className="product-price">₫{formatPrice(productPrice)}</p>
      </div>

      {/* Size Selection */}
      <div className="size-selection">
        <select
          value={currentSize}
          onChange={handleSizeChange}
          className="size-dropdown"
        >
          {availableSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="quantity-control">
        <button
          className="quantity-btn"
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          aria-label="Decrease quantity"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
        <span className="quantity-value">{item.quantity}</span>
        <button
          className="quantity-btn"
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          aria-label="Increase quantity"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <div className="cart-item-total">
        <p className="item-total">${formatPrice(itemTotal)}</p>
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