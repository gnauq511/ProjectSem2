import React, { useState, useEffect, useCallback, createContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import Collection from './components/pages/Collection';
import ProductDetail from './components/pages/ProductDetail';
import FeedbackForm from './components/pages/FeedbackForm';
import ContactForm from './components/pages/ContactForm';
import AboutUs from './components/pages/AboutUs';
import Search from './components/pages/Search';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CartPage from './components/pages/CartPage';
import OrdersPage from './components/pages/OrdersPage';
import PaymentSuccess from './components/pages/PaymentSuccess';
import PaymentCancel from './components/pages/PaymentCancel';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import ScrollToTop from './services/ScrollToTop';
import CartService from './services/CartService';
import './styles/App.css';
import './styles/Admin.css';

// Create cart context for global state management
export const CartContext = createContext();

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  
  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Load user from localStorage on component mount
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        console.log('User loaded from localStorage:', userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('currentUser'); // Clear invalid data
      }
    }
  }, []);
  
  // Function to fetch cart items (will be called only when needed, not automatically)
  // Wrapped in useCallback to prevent unnecessary re-renders
  const fetchCartItems = useCallback(async () => {
    if (currentUser && currentUser.customerId) {
      try {
        console.log('Manually fetching cart items for user:', currentUser.customerId);
        const items = await CartService.getCartItems(currentUser.customerId);
        setCartItems(items.map(item => ({
          ...item,
          id: item.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          selected: false,
          quantity: item.quantity
        })));
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
      }
    }
  }, [currentUser, setCartItems]);
  
  // Expose fetchCartItems to window object so Navbar can access it
  useEffect(() => {
    window.fetchCartItems = fetchCartItems;
    return () => {
      delete window.fetchCartItems;
    };
  }, [currentUser, fetchCartItems]);
  
  // We're no longer automatically fetching cart items when user changes
  // This prevents unnecessary API calls on page load

  // Cart functions
  const addToCart = async (product) => {
    if (!currentUser) {
      // Handle guest cart (localStorage or prompt to login)
      alert('Please login to add items to your cart');
      return;
    }
    
    // Use customerId instead of user id for cart operations
    const customerId = currentUser.customerId;
    if (!customerId) {
      console.error('No customer ID found for user:', currentUser);
      alert('Customer profile not found. Please try logging in again.');
      return;
    }
    
    try {
      await CartService.addToCart(customerId, product.id, 1);
      
      // Update local state
      setCartItems(prev => {
        const existingItem = prev.find(item => item.product?.id === product.id);
        if (existingItem) {
          return prev.map(item => 
            item.product?.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          return [...prev, { 
            product: product,
            id: Date.now(), // Temporary ID until we refresh from server
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1, 
            selected: false 
          }];
        }
      });
      
      // Refresh cart from server using our fetchCartItems function
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (id) => {
    if (!currentUser || !currentUser.customerId) return;
    
    try {
      await CartService.removeFromCart(id);
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (id, delta) => {
    if (!currentUser || !currentUser.customerId) return;
    
    try {
      const item = cartItems.find(item => item.id === id);
      if (!item) return;
      
      const newQuantity = Math.max(1, item.quantity + delta);
      
      // Update local state immediately for better UX
      setCartItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      // Update on server
      await CartService.updateCartItemQuantity(id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Refresh cart to ensure consistency using our fetchCartItems function
      await fetchCartItems();
    }
  };

  const toggleSelected = (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      toggleSelected,
      setCartItems,
      currentUser,
      setCurrentUser
    }}>
      <div className="app">
        {!isAdminRoute && <Navbar />}
        <ScrollToTop />
        <main className={isAdminRoute ? "admin-main-content" : "main-content"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/search" element={<Search />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </CartContext.Provider>
  );
}

export default App;
