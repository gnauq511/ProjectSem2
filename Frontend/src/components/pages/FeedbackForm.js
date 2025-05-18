import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faStar, 
  faPaperPlane,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/Forms.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    message: '',
    product: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message || formData.rating === 0) {
      setError('Please fill in all required fields and provide a rating');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Feedback submitted:', formData);
      setSubmitted(true);
    }, 1000);
  };
  
  if (submitted) {
    return (
      <div className="form-container">
        <div className="form-card success-card">
          <div className="success-icon">
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <h2>Thank You!</h2>
          <p>Your feedback has been submitted successfully. We appreciate your input!</p>
          <button 
            className="form-button"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                rating: 0,
                message: '',
                product: '',
              });
              setSubmitted(false);
            }}
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Share Your Feedback</h2>
          <p>We value your opinion! Let us know what you think about our products.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              <FontAwesomeIcon icon={faUser} /> Your Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} /> Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="product">Product</label>
            <select
              id="product"
              name="product"
              value={formData.product}
              onChange={handleChange}
            >
              <option value="">Select a product (optional)</option>
              <option value="sofa">Scandinavian Sofa</option>
              <option value="lamp">Hanging Lamp</option>
              <option value="table">Oak Dining Table</option>
              <option value="chair">Leather Armchair</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              Your Rating <span className="required">*</span>
            </label>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`rating-star ${formData.rating >= star ? 'active' : ''}`}
                  onClick={() => handleRatingChange(star)}
                >
                  <FontAwesomeIcon icon={faStar} />
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="message">
              Your Feedback <span className="required">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Share your experience with our product or service"
              rows="5"
            ></textarea>
          </div>
          
          <button type="submit" className="form-button">
            <FontAwesomeIcon icon={faPaperPlane} /> Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm; 