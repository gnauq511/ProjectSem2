import api from './api';

const CartService = {
  /**
   * Get all items in a customer's cart
   * @param {number} customerId - The customer ID
   * @returns {Promise} - Promise with cart items
   */
  getCartItems: async (customerId) => {
    try {
      const response = await api.get(`/cart/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return []; // Return empty array on error to prevent UI crashes
    }
  },

  /**
   * Add a product to the cart
   * @param {number} customerId - The customer ID
   * @param {number} productId - The product ID to add
   * @param {number} quantity - The quantity to add (default: 1)
   * @param {string} size - The size of the product
   * @returns {Promise} - Promise with the added cart item
   */
  addToCart: async (customerId, productId, quantity = 1, size) => {
    try {
      const response = await api.post(`/cart/${customerId}/add`, null, {
        params: {
          productId,
          quantity,
          size,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Update the quantity of a cart item
   * @param {number} cartItemId - The cart item ID
   * @param {number} quantity - The new quantity
   * @returns {Promise} - Promise with the updated cart item
   */
  updateCartItemQuantity: async (cartItemId, quantity) => {
    try {
      const response = await api.put(
        `/cart/item/${cartItemId}?quantity=${quantity}`
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      alert('Failed to update cart item. Please try again.');
      return null;
    }
  },

  /**
   * Remove an item from the cart
   * @param {number} cartItemId - The cart item ID to remove
   * @returns {Promise} - Promise with the result
   */
  removeFromCart: async (cartItemId) => {
    try {
      const response = await api.delete(`/cart/item/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart. Please try again.');
      return null;
    }
  },

  /**
   * Clear all items from a customer's cart
   * @param {number} customerId - The customer ID
   * @returns {Promise} - Promise with the result
   */
  clearCart: async (customerId) => {
    try {
      const response = await api.delete(`/cart/${customerId}/clear`);
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
      return null;
    }
  }
};

export default CartService;
