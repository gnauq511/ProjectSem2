import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShoppingBag, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { CartContext } from '../../App';
import api from '../../services/api';
import '../../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Ensure id is a number
        const productId = parseInt(id, 10);
        if (isNaN(productId)) {
          throw new Error('Invalid product ID');
        }
        
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data);
        
        // Fetch related products (same category)
        if (response.data.category && response.data.category.id) {
          const categoryId = response.data.category.id;
          const relatedResponse = await api.get(`/products?categoryId=${categoryId}`);
          // Filter out the current product and limit to 4 products
          const filtered = relatedResponse.data
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
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (product) {
      // Add product to cart with selected quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // Could add a toast notification here
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Render star rating
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

  // Generate product images (in a real app, would use actual images from the API)
  const getProductImages = () => {
    if (!product) return [];
    
    // If product has multiple images, use those
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    
    // Otherwise, use the main image and some placeholders
    const images = [];
    if (product.image) {
      images.push(`/${product.image}`);
    } else {
      images.push('/images/placeholder.png');
    }
    
    // Add some placeholder variations (in a real app, these would be actual product images)
    for (let i = 1; i < 4; i++) {
      images.push(`/images/placeholder${i}.png`);
    }
    
    return images;
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
  const productRating = product.rating || 4.5; // Default rating if none provided

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
                  <img src={img} alt={`${product.name} - view ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="category">
              {product.category && typeof product.category === 'object' 
                ? product.category.name 
                : product.category}
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
            
            <div className="price">
              {typeof product.price === 'object' 
                ? `$${product.price}` 
                : `$${product.price}`}
            </div>
            
            <div className="description">
              {product.description}
            </div>
            
            <div className="product-meta">
              <div className="meta-item">
                <span className="label">SKU:</span>
                <span className="value">{product.sku || `SKU-${product.id}`}</span>
              </div>
              
              <div className="meta-item">
                <span className="label">Availability:</span>
                <span className="value">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
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
              <p>{product.longDescription || product.description}</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl. Sed euismod, nisl eget aliquam ultricies, nisl nisl aliquet nisl, eget aliquam nisl nisl eget nisl.</p>
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
                      src={relatedProduct.image ? `/${relatedProduct.image}` : '/images/placeholder.png'} 
                      alt={relatedProduct.name} 
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
