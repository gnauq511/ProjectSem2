import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faPhone, 
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import '../../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateStep1 = () => {
    // Basic validation for step 1
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.phone) {
      setError('Please fill in all fields');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Phone validation (simple)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };
  
  const validateStep2 = () => {
    // Password validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
   
    
    return true;
  };
  
  const nextStep = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };
  
  const prevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    try {
      setLoading(true);
      setError('');
      
      // First API call - Register auth with username, email and password
      const authResponse = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Auth registered:', authResponse.data);

      // Extract userId from authResponse.
      // Common patterns: authResponse.data.id or authResponse.data.user.id
      // Adjust this line if your backend returns the ID differently.
      const userId = authResponse.data?.user?.id || authResponse.data?.id;

      if (!userId) {
        throw new Error('User ID not returned from auth registration. Cannot create customer profile.');
      }
      
      // Second API call - Create customer with first name, last name, phone, and associate with User ID
      const customerResponse = await api.post('/customers/create', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        user: { id: userId } // Associating with the user
      });
      
      console.log('Customer created:', customerResponse.data);
      
      // Registration successful
      setLoading(false);
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in to continue.' 
        } 
      });
      
    } catch (err) {
      setLoading(false);
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again later.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us and start shopping!</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <FontAwesomeIcon icon={step > 1 ? faCheckCircle : faUser} />
            <span>Personal Info</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faLock} />
            <span>Security</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">
                  <FontAwesomeIcon icon={faUser} /> First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Your first name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">
                  <FontAwesomeIcon icon={faUser} /> Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Your last name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username">
                  <FontAwesomeIcon icon={faUser} /> Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <FontAwesomeIcon icon={faEnvelope} /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">
                  <FontAwesomeIcon icon={faPhone} /> Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                />
              </div>
              
              <button 
                type="button" 
                className="auth-button" 
                onClick={nextStep}
              >
                Continue
              </button>
            </>
          )}
          
          {step === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="password">
                  <FontAwesomeIcon icon={faLock} /> Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FontAwesomeIcon icon={faLock} /> Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </div>
              
              
              
              <div className="button-group">
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={prevStep}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 