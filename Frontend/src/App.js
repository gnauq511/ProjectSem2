import React, { useState, createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import FeedbackForm from './components/pages/FeedbackForm';
import ContactForm from './components/pages/ContactForm';
import AboutUs from './components/pages/AboutUs';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CartPage from './components/pages/CartPage';
import './styles/App.css';

// Create cart context for global state management
export const CartContext = createContext();

function App() {
  const [cartItems, setCartItems] = useState([]);

  // Cart functions
  const addToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1, selected: false }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
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
      setCartItems 
    }}>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartContext.Provider>
  );
}

export default App;
