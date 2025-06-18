import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import ProductItem from '../common/ProductItem';
import { CartContext } from '../../App';
import api from '../../services/api';
import '../../styles/ProductDetail.css';
import ProductReviews from '../common/ProductReviews';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  // --- STATE AND HOOKS ---
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);

        if (response.data.categoryId) {
          const relatedResponse = await api.get(`/products?categoryId=${response.data.categoryId}`);
          const filtered = relatedResponse.data.content
            .filter(p => p.id !== response.data.id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews/product/${id}`);
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        // Non-critical, so we don't set a main error state
      }
    };

    if (id) {
      fetchProduct();
      fetchReviews();
    }
    window.scrollTo(0, 0);
  }, [id]);

  // --- HELPER FUNCTIONS ---
  const getStockForSize = (size) => {
    if (!product || !product.stockQuantity) return 0;
    const lowerSize = size.toLowerCase();
    const stock = product.stockQuantity;
    const keyCamelCase = `${lowerSize}Quantity`;
    const keyLowerCase = `${lowerSize}quantity`;
    return stock[keyCamelCase] || stock[keyLowerCase] || 0;
  };

  const getProductImages = useCallback(() => {
    if (!product) return [];
    const images = [product.image, product.imageView2, product.imageView3, product.imageView4].filter(Boolean);
    return images.length > 0 ? images : ['/images/placeholder.png'];
  }, [product]);

  // --- EVENT HANDLERS ---
  const handleGoBack = () => navigate(-1);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSizeError('');
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    const stock = getStockForSize(selectedSize);
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = useCallback(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      toast.error('Please log in to add items to your cart.');
      sessionStorage.setItem('pendingAction', JSON.stringify({ type: 'ADD_TO_CART', productId: product.id, quantity, size: selectedSize }));
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    addToCart(product, quantity, selectedSize);
    toast.success(`${product.name} added to cart!`);
  }, [addToCart, location, navigate, product, quantity, selectedSize]);

  const handleCheckoutNow = useCallback(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      toast.error('Please log in to check out.');
      sessionStorage.setItem('pendingAction', JSON.stringify({ type: 'CHECKOUT', productId: product.id, quantity, size: selectedSize }));
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    // Add to cart for persistence in case the user navigates away
    addToCart(product, quantity, selectedSize);

    // Prepare the item to be passed directly to the checkout page
    const itemForCheckout = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: getProductImages()[0], // Use the main product image
      size: selectedSize,
    };

    // Navigate to checkout, passing the item in the state
    navigate('/checkout', { state: { items: [itemForCheckout] } });
  }, [addToCart, getProductImages, location, navigate, product, quantity, selectedSize]);

  // --- PENDING ACTION AFTER LOGIN ---
  useEffect(() => {
    const pendingAction = JSON.parse(sessionStorage.getItem('pendingAction'));
    // Ensure product is loaded before checking for pending action
    if (pendingAction && product && pendingAction.productId === product.id) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        // Restore state from pending action
        setSelectedSize(pendingAction.size);
        setQuantity(pendingAction.quantity);

        // Defer the action to allow the state to update
        setTimeout(() => {
          if (pendingAction.type === 'ADD_TO_CART') {
            handleAddToCart();
          } else if (pendingAction.type === 'CHECKOUT') {
            handleCheckoutNow();
          }
          sessionStorage.removeItem('pendingAction');
        }, 100);
      }
    }
  }, [product, handleAddToCart, handleCheckoutNow]);

  // --- RENDER FUNCTIONS ---
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<FontAwesomeIcon key={i} icon={faStar} />);
      else if (i === fullStars + 1 && hasHalfStar) stars.push(<FontAwesomeIcon key={i} icon={faStarHalfAlt} />);
      else stars.push(<FontAwesomeIcon key={i} icon={farStar} />);
    }
    return stars;
  };

  // --- LOADING AND ERROR STATES ---
  if (loading) return <div className="wrapper"><p>Loading...</p></div>;
  if (error) return <div className="wrapper"><p>{error}</p><button onClick={handleGoBack}>Go Back</button></div>;
  if (!product) return <div className="wrapper"><p>Product not found.</p></div>;

  // --- DERIVED STATE ---
  const productImages = getProductImages();
  const stockForSelectedSize = selectedSize ? getStockForSize(selectedSize) : 0;
  const isAddToCartDisabled = !selectedSize || stockForSelectedSize === 0;

  // --- RENDER ---
  return (
    <div className="product-detail" key={id}>
      <div className="product-detail__wrapper">
        <button className="product-detail__back-btn" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>

        <main className="product-detail__main">
          {/* Gallery */}
          <section className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img src={productImages[activeImage]} alt={product.name} />
            </div>
            <div className="product-detail__thumbnails">
              {productImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className={`product-detail__thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                  onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                />
              ))}
            </div>
          </section>

          {/* Info */}
          <section className="product-detail__info">
            <header>
              <p className="product-detail__category">{product.categoryName || 'Uncategorized'}</p>
              <h1 className="product-detail__name">{product.name}</h1>
              <div className="product-detail__rating">
                <div className="product-detail__stars">{renderRating(product.rating || 4.5)}</div>
                <span>({product.reviewCount || 0} reviews)</span>
              </div>
              <p className="product-detail__price">${product.price.toFixed(2)}</p>
            </header>

            <p className="product-detail__description">{product.description}</p>

            <div className="product-detail__controls">
              {/* Sizes */}
              <div className="product-detail__control-group">
                <label className="product-detail__label">Select Size:</label>
                <div className="product-detail__size-options">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      className={`product-detail__size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => handleSizeSelect(size)}
                      disabled={getStockForSize(size) === 0}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && <p className="product-detail__error">{sizeError}</p>}
              </div>

              {/* Quantity */}
              <div className="product-detail__control-group">
                <label className="product-detail__label">Quantity:</label>
                <div className="product-detail__quantity-selector">
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={!selectedSize || quantity >= stockForSelectedSize}>+</button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail__actions">
              <button className="btn btn--primary" onClick={handleAddToCart} disabled={isAddToCartDisabled}>
                Add to Cart
              </button>
              <button className="btn btn--primary" onClick={handleCheckoutNow}>
                Checkout Now
              </button>
            </div>

            <div className="product-detail__meta">
              <p>SKU: {product.sku || `SKU-${product.id}`}</p>
              <p>Availability: 
                <span className={selectedSize && stockForSelectedSize > 0 ? 'in-stock' : 'out-of-stock'}>
                  {selectedSize ? `${stockForSelectedSize} in stock` : 'Select a size'}
                </span>
              </p>
            </div>
          </section>
        </main>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="product-detail__related">
            <h2>Related Products</h2>
            <div className="product-detail__related-grid">
              {relatedProducts.map(p => (
                <ProductItem key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <ProductReviews reviews={reviews} />
      </div>
    </div>
  );
};

export default ProductDetail;
