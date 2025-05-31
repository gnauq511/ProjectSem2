package com.project.service;

import com.project.model.Cart;
import com.project.model.CartItem;
import com.project.model.Customer;
import com.project.model.Product;
import com.project.repository.CartRepository;
import com.project.repository.CartItemRepository;
import com.project.repository.ProductRepository;
import com.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    /**
     * Get or create a cart for a customer
     */
    @Transactional
    public Cart getOrCreateCart(Customer customer) {
        Optional<Cart> existingCart = cartRepository.findByCustomerId(customer.getId());

        if (existingCart.isPresent()) {
            return existingCart.get();
        } else {
            Cart newCart = new Cart();
            newCart.setCustomer(customer);
            newCart.setCreatedAt(LocalDateTime.now());
            return cartRepository.save(newCart);
        }
    }

    /**
     * Get cart by customer ID
     */
    public Optional<Cart> getCartByCustomerId(Long customerId) {
        return cartRepository.findByCustomerId(customerId);
    }

    /**
     * Add a product to the customer's cart
     */
    @Transactional
    public CartItem addItemToCart(Long customerId, Long productId, Integer quantity) {
        try {
            System.out.println("Adding item to cart - Customer ID: " + customerId + ", Product ID: " + productId + ", Quantity: " + quantity);

            // Get the customer's cart
            Optional<Cart> optionalCart = cartRepository.findByCustomerId(customerId);
            Cart cart;

            if (optionalCart.isPresent()) {
                cart = optionalCart.get();
                System.out.println("Found cart with ID: " + cart.getId());
            } else {
                System.out.println("No cart found for customer ID: " + customerId + ". Creating a new cart.");

                // Find the customer
                Optional<Customer> customerOpt = customerRepository.findById(customerId);
                if (!customerOpt.isPresent()) {
                    System.err.println("Customer not found with ID: " + customerId);
                    throw new RuntimeException("Customer not found with ID: " + customerId);
                }

                // Create a new cart for the customer
                Customer customer = customerOpt.get();
                cart = new Cart();
                cart.setCustomer(customer);
                cart.setCreatedAt(LocalDateTime.now());
                cart = cartRepository.save(cart);
                System.out.println("Created new cart with ID: " + cart.getId());
            }

            // Get the product
            Optional<Product> optionalProduct = productRepository.findById(productId);
            Product product;

            if (optionalProduct.isPresent()) {
                product = optionalProduct.get();
                System.out.println("Found product: " + product.getName());
            } else {
                System.err.println("Product not found with ID: " + productId);
                throw new RuntimeException("Product not found with ID: " + productId);
            }

            // Check if the product is already in the cart
            Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

            if (existingItem.isPresent()) {
                // Update quantity if the product is already in the cart
                CartItem cartItem = existingItem.get();
                int newQuantity = cartItem.getQuantity() + quantity;
                System.out.println("Updating existing cart item. New quantity: " + newQuantity);
                cartItem.setQuantity(newQuantity);
                return cartItemRepository.save(cartItem);
            } else {
                // Add new item to cart
                System.out.println("Adding new item to cart");
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                CartItem savedItem = cartItemRepository.save(newItem);
                System.out.println("Successfully added item to cart with ID: " + savedItem.getId());
                return savedItem;
            }
        } catch (Exception e) {
            System.err.println("Error adding item to cart: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to let the controller handle it
        }
    }

    /**
     * Update the quantity of an item in the cart
     */
    @Transactional
    public CartItem updateCartItemQuantity(Long cartItemId, Integer quantity) {
        try {
            System.out.println("Updating cart item quantity: ID=" + cartItemId + ", quantity=" + quantity);

            Optional<CartItem> optionalCartItem = cartItemRepository.findById(cartItemId);
            CartItem cartItem;

            if (optionalCartItem.isPresent()) {
                cartItem = optionalCartItem.get();
                // Force initialization of product to avoid lazy loading issues
                if (cartItem.getProduct() != null) {
                    cartItem.getProduct().getName(); // Touch the product to initialize it
                }
            } else {
                System.err.println("Cart item not found with ID: " + cartItemId);
                throw new RuntimeException("Cart item not found with ID: " + cartItemId);
            }

            if (quantity <= 0) {
                System.out.println("Deleting cart item due to quantity <= 0");
                cartItemRepository.delete(cartItem);
                return null;
            } else {
                cartItem.setQuantity(quantity);
                CartItem savedItem = cartItemRepository.save(cartItem);
                System.out.println("Successfully updated cart item quantity");
                return savedItem;
            }
        } catch (Exception e) {
            System.err.println("Error updating cart item quantity: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to be handled by the controller
        }
    }

    /**
     * Remove an item from the cart
     */
    @Transactional
    public void removeItemFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    /**
     * Get all items in a customer's cart
     */
    @Transactional
    public List<CartItem> getCartItems(Long customerId) {
        try {
            System.out.println("Getting cart items for customer ID: " + customerId);
            Optional<Cart> optionalCart = cartRepository.findByCustomerId(customerId);
            Cart cart;

            if (optionalCart.isPresent()) {
                cart = optionalCart.get();
                System.out.println("Found cart with ID: " + cart.getId());
            } else {
                System.out.println("No cart found for customer ID: " + customerId + ". Creating a new cart.");

                // Find the customer
                Optional<Customer> customerOpt = customerRepository.findById(customerId);
                if (!customerOpt.isPresent()) {
                    System.err.println("Customer not found with ID: " + customerId);
                    return List.of();
                }

                // Create a new cart for the customer
                Customer customer = customerOpt.get();
                cart = new Cart();
                cart.setCustomer(customer);
                cart.setCreatedAt(LocalDateTime.now());
                cart = cartRepository.save(cart);
                System.out.println("Created new cart with ID: " + cart.getId());
            }

            List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
            System.out.println("Found " + items.size() + " items in cart");
            return items;
        } catch (Exception e) {
            System.err.println("Error getting cart items: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Clear all items from a customer's cart
     */
    @Transactional
    public void clearCart(Long customerId) {
        Optional<Cart> optionalCart = cartRepository.findByCustomerId(customerId);
        if (optionalCart.isPresent()) {
            cartItemRepository.deleteByCartId(optionalCart.get().getId());
        }
    }
}
