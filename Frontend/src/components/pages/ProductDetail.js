import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingBag, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { CartContext } from '../../App';
import api from '../../services/api';
import '../../styles/ProductDetail.css';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [stockForSelectedSize, setStockForSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
          throw new Error('Invalid product ID');
        }
        
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        
        if (response.data.categoryId) {
          // Fetch related products using the correct endpoint
          const relatedResponse = await api.get(`/products?categoryId=${response.data.categoryId}`);
          // The endpoint returns a Page object, so we access the 'content' property
          const filtered = relatedResponse.data.content
            .filter(p => p.id !== response.data.id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
    window.scrollTo(0, 0);
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const getStockForSize = (size) => {
    if (!product || !product.stockQuantity) {
      return 0;
    }
    const lowerSize = size.toLowerCase();
    const stock = product.stockQuantity;

    // Handle inconsistent casing from the backend by checking for multiple possible keys
    const keyCamelCase = `${lowerSize}Quantity`;   // For xlQuantity, xxlQuantity
    const keyLowerCase = `${lowerSize}quantity`;   // For squantity, mquantity

    return stock[keyCamelCase] || stock[keyLowerCase] || 0;
  };

  const handleSizeSelect = (size) => {
    const stock = getStockForSize(size);
    setSelectedSize(size);
    setStockForSelectedSize(stock);
    if (stock > 0) {
      setSizeError('');
    } else {
      setSizeError('This size is out of stock.');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError('Please select a size.');
      return;
    }
    if (product) {
      addToCart(product, quantity, selectedSize);
      toast.success(`${product.name} has been added to your cart!`);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} className="star half" />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={farStar} className="star empty" />);
      }
    }
    
    return stars;
  };

  const getProductImages = () => {
    if (!product) return [];
    
    const images = [product.image, product.imageView2, product.imageView3, product.imageView4].filter(Boolean);
    
    return images.length > 0 ? images : ['/images/placeholder.png'];
  };

  if (loading) {
    return (
      <div className="product-detail-page wrapper">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page wrapper">
        <div className="error">
          <p>{error || 'Product not found'}</p>
          <button className="btn brown-bg" onClick={handleGoBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const productImages = getProductImages();
  const productRating = product.rating || 4.5; // Default rating

  return (
    <div className="product-detail-page">
      <div className="wrapper">
        <button className="back-button" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <div className="product-detail-container">
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={productImages[activeImage]} 
                alt={product.name} 
              />
            </div>
            
            <div className="thumbnail-gallery">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} - view ${index + 1}`} 
                    onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="category">
              {product.categoryName || 'Uncategorized'}
            </div>
            
            <h1 className="product-name">{product.name}</h1>
            
            <div className="rating-container">
              <div className="stars">
                {renderRating(productRating)}
              </div>
              <span className="rating-text">
                {productRating.toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
            
            <div className="price">${product.price}</div>
            
            <div className="description">
              {product.description}
            </div>

            {/* Size Selection */}
            <div className="size-selection">
              <span className="size-label">Select Size:</span>
              <div className="size-options">
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                    disabled={getStockForSize(size) === 0}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && <p className="size-error">{sizeError}</p>}
            </div>
            
            <div className="product-meta">
              <div className="meta-item">
                <span className="label">SKU:</span>
                <span className="value">{product.sku || `SKU-${product.id}`}</span>
              </div>
              
              <div className="meta-item">
                <span className="label">Availability:</span>
                <span className={`value ${selectedSize && stockForSelectedSize > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {selectedSize
                    ? stockForSelectedSize > 0
                      ? `${stockForSelectedSize} in stock`
                      : 'Out of Stock'
                    : 'Select a size'}
                </span>
              </div>
            </div>
            
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
              
              <button 
                className="add-to-cart-btn btn brown-bg"
                onClick={handleAddToCart}
              >
                <FontAwesomeIcon icon={faShoppingBag} /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Product details tabs */}
        <div className="product-tabs">
          <div className="tab-headers">
            <div className="tab-header active">Description</div>
            <div className="tab-header">Specifications</div>
            <div className="tab-header">Reviews</div>
          </div> 
          
          <div className="tab-content">
            <div className="tab-pane active">
              <h3>Product Description</h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-products-grid">
              {relatedProducts.map(relatedProduct => (
                <div 
                  key={relatedProduct.id} 
                  className="related-product-card"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="related-product-image">
                    <img 
                      src={relatedProduct.image ? relatedProduct.image : '/images/placeholder.png'} 
                      alt={relatedProduct.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="related-product-info">
                    <h4>{relatedProduct.name}</h4>
                    <p className="price">
                      {typeof relatedProduct.price === 'object' 
                        ? `$${relatedProduct.price}` 
                        : `$${relatedProduct.price}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
