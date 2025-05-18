import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faPaperPlane,
  faMapMarkerAlt,
  faCheck,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/Forms.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
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
      console.log('Contact form submitted:', formData);
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
          <h2>Message Sent!</h2>
          <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
          <button 
            className="form-button"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
              });
              setSubmitted(false);
            }}
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Get in touch with our team for any questions or inquiries</p>
      </div>
      
      <div className="contact-container">
        <div className="contact-info">
          <h3>Our Information</h3>
          <p>Feel free to reach out to us using any of the contact methods below.</p>
          
          <div className="contact-detail">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <div>
              <h4>Address</h4>
              <p>123 Furniture Street, Design District<br />New York, NY 10001</p>
            </div>
          </div>
          
          <div className="contact-detail">
            <FontAwesomeIcon icon={faPhone} />
            <div>
              <h4>Phone</h4>
              <p>(123) 456-7890</p>
            </div>
          </div>
          
          <div className="contact-detail">
            <FontAwesomeIcon icon={faEnvelope} />
            <div>
              <h4>Email</h4>
              <p>info@hihihi.com</p>
            </div>
          </div>
          
          <div className="contact-detail">
            <FontAwesomeIcon icon={faBuilding} />
            <div>
              <h4>Working Hours</h4>
              <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
        
        <div className="form-card contact-form">
          <div className="form-header">
            <h2>Send Us a Message</h2>
            <p>We'll get back to you as soon as possible</p>
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
              <label htmlFor="phone">
                <FontAwesomeIcon icon={faPhone} /> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number (optional)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">
                Your Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                rows="5"
              ></textarea>
            </div>
            
            <button type="submit" className="form-button">
              <FontAwesomeIcon icon={faPaperPlane} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm; 