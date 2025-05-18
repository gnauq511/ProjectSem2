import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import '../../styles/Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Display success message if redirected from register page
  useEffect(() => {
    if (location.state?.message) {
      setError(''); // Clear any existing errors
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    
    try {
      setLoading(true);
      setError('');
      
      // Make API call to authenticate user
      const response = await api.post('/auth/login', {
        username,
        password,
        rememberMe
      });
      
      console.log('Login successful:', response.data);
      
      // If backend uses session cookies, a successful response means authentication is done.
      // The browser will handle the session cookie automatically.
      if (response.data?.result === true || (response.status >= 200 && response.status < 300)) {
        // Optional: If you still want to use `rememberMe` to inform the backend
        // to set a persistent session cookie, ensure `rememberMe` is sent in the request payload.
        // The current backend call already includes it.

        // Redirect to home page or dashboard
        navigate('/');
      } else {
        // Handle cases where login might not be truly successful despite a 2xx response
        // or if response.data.result is explicitly false.
        setError(
          response.data?.message ||
          'Login failed. Please check your credentials and try again.'
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Welcome back! Please login to your account.</p>
        </div>
        
        {location.state?.message && (
          <div className="success-message">{location.state.message}</div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <FontAwesomeIcon icon={faUser} /> Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} /> Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          
          
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 