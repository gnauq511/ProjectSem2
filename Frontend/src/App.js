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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        const items = await CartService.getCartItems(currentUser.customerId);
        setCartItems(items.map(item => ({
          id: item.id, // This is the cart_item_id
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity,
          size: item.size,
          selected: false,
        })));
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = useCallback(async (product, quantity, size) => {
    if (!currentUser || !currentUser.customerId) {
      console.error("Customer not logged in");
      // Optionally, trigger login modal or redirect
      return;
    }

    try {
      const response = await CartService.addToCart(currentUser.customerId, product.id, quantity, size);

      if (response.data && response.data.cartItem) {
        // Optimistically update the cart or refetch
        fetchCartItems();
        console.log('Item added to cart:', response.data.cartItem);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  }, [currentUser, fetchCartItems]);

  const removeFromCart = async (id) => {
    if (!currentUser || !currentUser.customerId) return;
    try {
      await CartService.removeFromCart(id);
      await fetchCartItems(); // Refresh cart from server
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (id, delta) => {
    if (!currentUser || !currentUser.customerId) return;
    
    const itemToUpdate = cartItems.find(item => item.id === id);
    if (!itemToUpdate) return;
    
    const newQuantity = itemToUpdate.quantity + delta;
    
    if (newQuantity < 1) {
      await removeFromCart(id);
    } else {
      try {
        await CartService.updateCartItemQuantity(id, newQuantity);
        await fetchCartItems(); // Refresh cart from server
      } catch (error) {
        console.error('Error updating quantity:', error);
        await fetchCartItems(); // Re-fetch to revert any optimistic UI changes
      }
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
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
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
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />
            
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
