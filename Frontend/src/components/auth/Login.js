import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';
import { CartContext } from '../../App';
import '../../styles/Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useContext(CartContext);

  // Display success message if redirected from register page
  useEffect(() => {
    if (location.state?.message) {
      setError(''); // Clear any existing errors
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if(username.length < 6){
      setError('Username must be at least 6 characters long');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/login', {
        username,
        password
      });
      
      console.log('Login response:', response.data);

      // Check if the login was actually successful by examining the result field
      if (response.data?.result === true) {
        // Use the user data from the data field in the response
        const userData = response.data.data;
        
        if (userData) {
          // Store user data in localStorage and context
          const userToStore = {
            id: userData.id,
            username: userData.username,
            customerId: userData.customerId,
            role: userData.role
          };
          
          // Log the customer ID for debugging
          console.log('Customer ID from backend:', userData.customerId);
          
          console.log('Storing user data:', userToStore);
          localStorage.setItem('currentUser', JSON.stringify(userToStore));
          setCurrentUser(userToStore);
          
          // Navigate to home page
          navigate('/');
        } else {
          console.error('No user data in login response');
          setError('Login successful but user data is missing');
        }
      } else {
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