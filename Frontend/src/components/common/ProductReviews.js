import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import '../../styles/ProductReviews.css';

const ProductReviews = ({ reviews }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    if (!reviews || reviews.length === 0) {
        return (
            <div className="product-reviews">
                <h2>Product Reviews</h2>
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++;
        }
    });
    ratingCounts.reverse(); // For 5 to 1 star order

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} className={i <= rating ? 'star-filled' : 'star-empty'} />);
        }
        return stars;
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <section className="product-reviews">
            <h2>Product Reviews</h2>
            <div className="reviews-summary">
                <div className="summary-overview">
                    <div className="average-rating-circle">
                        <span className="average-rating-value">{averageRating.toFixed(1)}</span>
                    </div>
                    <div className="average-rating-stars">
                        {renderStars(averageRating)}
                    </div>
                    <p>from {reviews.length} reviews</p>
                </div>
                <div className="summary-breakdown">
                    {[5, 4, 3, 2, 1].map((star, index) => (
                        <div className="breakdown-row" key={star}>
                            <span>{star} <FontAwesomeIcon icon={faStar} /></span>
                            <div className="bar-container">
                                <div 
                                    className="bar-fill"
                                    style={{ width: `${(ratingCounts[index] / reviews.length) * 100}%` }}
                                ></div>
                            </div>
                            <span>{ratingCounts[index]}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="reviews-list-container">
                <div className="review-list">
                    <h3>Review Lists</h3>
                    {reviews.map(review => (
                        <div className="review-item" key={review.id}>
                            <div className="review-author">
                                <div className="author-avatar">{review.customerName.charAt(0)}</div>
                                <span className="author-name">{review.customerName}</span>
                            </div>
                            <div className="review-content">
                                <div className="review-stars">{renderStars(review.rating)}</div>
                                <p className="review-date">{new Date(review.reviewDate).toLocaleDateString()}</p>
                                <p className="review-comment">{review.comment}</p>
                                {review.mediaUrl && (
                                    <img 
                                        src={`http://localhost:8080/uploads/${review.mediaUrl}`}
                                        alt="Review media" 
                                        className="review-media-thumbnail" 
                                        onClick={() => openImageModal(`http://localhost:8080/uploads/${review.mediaUrl}`)}
                                        onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {selectedImage && (
            <div className="image-modal-overlay" onClick={closeImageModal}>
                <span className="image-modal-close">&times;</span>
                <img src={selectedImage} alt="Full size review" className="image-modal-content" />
            </div>
        )}
        </>
    );
};

export default ProductReviews;
