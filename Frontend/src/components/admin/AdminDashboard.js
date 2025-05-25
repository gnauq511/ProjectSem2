import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faBox, faSignOutAlt, faTachometerAlt, faPlusCircle,
  faChartLine, faDollarSign, faShoppingCart, faTruck, faBan,
  faAward, faBell, faExclamationTriangle, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import AdminProductList from './AdminProductList';
import AdminProductForm from './AdminProductForm';
import AdminCategoryList from './AdminCategoryList';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in as admin
    const storedUser = localStorage.getItem('adminUser');
    if (!storedUser) {
      navigate('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (!user.role) {
        // If no role or not admin role, redirect to login
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
      setAdminUser(user);
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <AdminProductList />;
      case 'add-product':
        return <AdminProductForm />;
      case 'categories':
        return <AdminCategoryList />;
      case 'dashboard':
      default:
        return (
          <div className="admin-welcome">
            <h2>Welcome to Admin Dashboard</h2>
            <p>Select an option from the sidebar to manage your store.</p>
            
            {/* Revenue Statistics */}
            <div className="dashboard-section">
              <h3><FontAwesomeIcon icon={faChartLine} /> Revenue Overview</h3>
              <div className="admin-stats">
                <div className="stat-card revenue-card">
                  <h4>Daily Revenue</h4>
                  <p className="stat-value">$1,250.00</p>
                  <p className="stat-change positive">+15% from yesterday</p>
                </div>
                <div className="stat-card revenue-card">
                  <h4>Monthly Revenue</h4>
                  <p className="stat-value">$42,800.00</p>
                  <p className="stat-change positive">+8% from last month</p>
                </div>
                <div className="stat-card revenue-card">
                  <h4>Yearly Revenue</h4>
                  <p className="stat-value">$518,400.00</p>
                  <p className="stat-change positive">+22% from last year</p>
                </div>
              </div>
            </div>
            
            {/* Order Statistics */}
            <div className="dashboard-section">
              <h3><FontAwesomeIcon icon={faShoppingCart} /> Order Status</h3>
              <div className="admin-stats">
                <div className="stat-card order-card">
                  <div className="stat-icon new"><FontAwesomeIcon icon={faShoppingCart} /></div>
                  <div className="stat-info">
                    <h4>New Orders</h4>
                    <p className="stat-value">24</p>
                  </div>
                </div>
                <div className="stat-card order-card">
                  <div className="stat-icon processing"><FontAwesomeIcon icon={faTruck} /></div>
                  <div className="stat-info">
                    <h4>Processing</h4>
                    <p className="stat-value">18</p>
                  </div>
                </div>
                <div className="stat-card order-card">
                  <div className="stat-icon shipped"><FontAwesomeIcon icon={faTruck} /></div>
                  <div className="stat-info">
                    <h4>Shipped</h4>
                    <p className="stat-value">32</p>
                  </div>
                </div>
                <div className="stat-card order-card">
                  <div className="stat-icon canceled"><FontAwesomeIcon icon={faBan} /></div>
                  <div className="stat-info">
                    <h4>Canceled</h4>
                    <p className="stat-value">5</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Best Selling Products */}
            <div className="dashboard-section">
              <h3><FontAwesomeIcon icon={faAward} /> Best-Selling Products</h3>
              <div className="best-selling-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="product-cell">
                          <img src="https://via.placeholder.com/50" alt="Product" />
                          <span>Áo thun nam</span>
                        </div>
                      </td>
                      <td>$199.00</td>
                      <td>128</td>
                      <td>$25,472.00</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="product-cell">
                          <img src="https://via.placeholder.com/50" alt="Product" />
                          <span>Giày sneaker</span>
                        </div>
                      </td>
                      <td>$499.00</td>
                      <td>45</td>
                      <td>$22,455.00</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="product-cell">
                          <img src="https://via.placeholder.com/50" alt="Product" />
                          <span>Quần jeans nữ</span>
                        </div>
                      </td>
                      <td>$349.00</td>
                      <td>56</td>
                      <td>$19,544.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Revenue Chart */}
            <div className="dashboard-section">
              <h3><FontAwesomeIcon icon={faDollarSign} /> Revenue Chart</h3>
              <div className="chart-container">
                <div className="revenue-chart">
                  <div className="chart-placeholder">
                    <p>Revenue chart visualization would appear here</p>
                    <p className="chart-note">Showing monthly revenue for the past 12 months</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notifications */}
            <div className="dashboard-section">
              <h3><FontAwesomeIcon icon={faBell} /> Notifications</h3>
              <div className="notifications-list">
                <div className="notification-item low-stock">
                  <div className="notification-icon">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </div>
                  <div className="notification-content">
                    <h4>Low Stock Alert</h4>
                    <p>Áo khoác nam has only 5 items left in stock</p>
                    <span className="notification-time">2 hours ago</span>
                  </div>
                </div>
                <div className="notification-item refund">
                  <div className="notification-icon">
                    <FontAwesomeIcon icon={faDollarSign} />
                  </div>
                  <div className="notification-content">
                    <h4>Refund Request</h4>
                    <p>Customer #1058 has requested a refund for order #8754</p>
                    <span className="notification-time">5 hours ago</span>
                  </div>
                </div>
                <div className="notification-item low-stock">
                  <div className="notification-icon">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </div>
                  <div className="notification-content">
                    <h4>Low Stock Alert</h4>
                    <p>Giày sneaker has only 8 items left in stock</p>
                    <span className="notification-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="admin-stats quick-actions">
              <div className="stat-card">
                <h3>Products</h3>
                <p>Manage your product inventory</p>
                <button 
                  className="admin-action-btn"
                  onClick={() => setActiveSection('products')}
                >
                  <FontAwesomeIcon icon={faBox} /> View Products
                </button>
              </div>
              <div className="stat-card">
                <h3>New Product</h3>
                <p>Add a new product to your store</p>
                <button 
                  className="admin-action-btn"
                  onClick={() => setActiveSection('add-product')}
                >
                  <FontAwesomeIcon icon={faPlusCircle} /> Add Product
                </button>
              </div>
              <div className="stat-card">
                <h3>Categories</h3>
                <p>Manage product categories</p>
                <button 
                  className="admin-action-btn"
                  onClick={() => setActiveSection('categories')}
                >
                  <FontAwesomeIcon icon={faLayerGroup} /> Manage Categories
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!adminUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>Admin Panel</h3>
          <p>{adminUser.username}</p>
        </div>
        <ul className="admin-menu">
          <li 
            className={activeSection === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveSection('dashboard')}
          >
            <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
          </li>
          <li 
            className={activeSection === 'products' ? 'active' : ''}
            onClick={() => setActiveSection('products')}
          >
            <FontAwesomeIcon icon={faBox} /> Products
          </li>
          <li 
            className={activeSection === 'add-product' ? 'active' : ''}
            onClick={() => setActiveSection('add-product')}
          >
            <FontAwesomeIcon icon={faPlusCircle} /> Add Product
          </li>
          <li 
            className={activeSection === 'categories' ? 'active' : ''}
            onClick={() => setActiveSection('categories')}
          >
            <FontAwesomeIcon icon={faLayerGroup} /> Categories
          </li>
          <li onClick={() => navigate('/')}>
            <FontAwesomeIcon icon={faHome} /> Go to Site
          </li>
          <li onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </li>
        </ul>
      </div>
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
