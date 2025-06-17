import React, { useState, useEffect, useContext } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../App';
import '../../styles/FeedbackPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSpinner, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const FeedbackPage = () => {
  const { showAlert } = useAlert();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(CartContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
        // Initialize reviews state for each item
        const initialReviews = {};
        response.data.orderItems.forEach(item => {
          initialReviews[item.product.id] = {
            rating: 0,
            comment: '',
            media: null,
          };
        });
        setReviews(initialReviews);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleRatingChange = (productId, rating) => {
    setReviews(prev => ({ ...prev, [productId]: { ...prev[productId], rating } }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviews(prev => ({ ...prev, [productId]: { ...prev[productId], comment } }));
  };

  const handleMediaChange = (productId, files) => {
    if (files.length > 0) {
      setReviews(prev => ({ ...prev, [productId]: { ...prev[productId], media: files[0] } }));
    }
  };

  const handleSubmit = async (productId) => {
    if (!currentUser) {
      showAlert('Please log in to submit a review.', 'error');
      return;
    }

    const reviewData = reviews[productId];
    if (reviewData.rating === 0) {
      showAlert('Please provide a rating.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('customerId', currentUser.customerId);
    formData.append('rating', reviewData.rating);
    formData.append('comment', reviewData.comment);
    if (reviewData.media) {
      formData.append('media', reviewData.media);
    }

    try {
      // This endpoint needs to be created in the backend
      await api.post('/reviews/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showAlert('Review submitted successfully!', 'success');
      // Optionally, disable the form for this product
    } catch (error) {
      console.error('Error submitting review:', error);
      showAlert('Failed to submit review. Please try again.', 'error');
    }
  };

  if (loading) {
    return <div className="feedback-loading"><FontAwesomeIcon icon={faSpinner} spin /> Loading...</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div className="feedback-page-container">
      <button onClick={() => navigate('/orders')} className="back-to-orders-btn">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to My Orders
      </button>
      <h1>Leave a Review</h1>
      <p>Order ID: CTH-{order.id}</p>

      <div className="review-items-list">
        {order.orderItems.map(item => (
          <div key={item.product.id} className="review-item-card">
            <div className="review-item-info">
              <img src={item.product.image} alt={item.product.name} className="review-item-image" />
              <div className="review-item-details">
                <h4>{item.product.name}</h4>
                <p>Size: {item.size}</p>
              </div>
            </div>
            <div className="review-form">
              <div className="rating-input">
                <h5>Your Rating</h5>
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <FontAwesomeIcon
                      key={ratingValue}
                      icon={faStar}
                      className={ratingValue <= reviews[item.product.id]?.rating ? 'star-selected' : 'star-unselected'}
                      onClick={() => handleRatingChange(item.product.id, ratingValue)}
                    />
                  );
                })}
              </div>
              <div className="comment-input">
                <h5>Your Comment</h5>
                <textarea
                  rows="4"
                  placeholder="What did you think of the product?"
                  value={reviews[item.product.id]?.comment}
                  onChange={(e) => handleCommentChange(item.product.id, e.target.value)}
                ></textarea>
              </div>
              <div className="media-input">
                <h5>Add Photo or Video</h5>
                <input type="file" accept="image/*,video/*" onChange={(e) => handleMediaChange(item.product.id, e.target.files)} />
              </div>
              <button className="submit-review-btn" onClick={() => handleSubmit(item.product.id)}>
                Submit Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPage;
