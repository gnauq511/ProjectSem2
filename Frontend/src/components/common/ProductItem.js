import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from '../../App';
import '../../styles/ProductItem.css';

const ProductItem = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { currentUser } = useContext(CartContext);

  // Handle null or undefined product
  if (!product) return null;

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the add to cart button
    
    if (!currentUser) {
      // If user is not logged in, redirect to login page
      navigate('/login');
      return;
    }
    
    onAddToCart(product);
  };

  return (
    <div className="product-card" onClick={handleProductClick}>
      <div className="product-image">
        <img 
          src={product.image && product.image.startsWith('http') ? product.image : product.image ? `${process.env.REACT_APP_API_URL || ''}${product.image.startsWith('/') ? '' : '/'}${product.image}` : '/images/placeholder.png'} 
          alt={product.name || 'Product'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = '/images/placeholder.png'; // Fallback image
            console.warn("Failed to load image:", product.image);
          }}
        />
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCartClick}
        >
          <FontAwesomeIcon icon={faShoppingBag} /> Add to cart
        </button>
      </div>

      <div className="product-info">
        <small>
          {product.category && typeof product.category === 'object' 
            ? product.category.name 
            : product.category}
        </small>
        <h6 className="h6-heading">{product.name}</h6>
        <p className="description">
          {product.description && product.description.length > 50 
            ? `${product.description.substring(0, 50)}...` 
            : product.description}
        </p>
        <p className="price">
          {typeof product.price === 'object' 
            ? `$${product.price}` 
            : `$${product.price}`}
        </p>
      </div>
    </div>
  );
};

export default ProductItem;