package com.project.controller;

import com.project.model.CartItem;
import com.project.model.Customer;
import com.project.service.CartService;
import com.project.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"})
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private CustomerService customerService;

    /**
     * Get all items in the customer's cart
     */
    @GetMapping("/{customerId}")
    public ResponseEntity<?> getCartItems(@PathVariable Long customerId) {
        try {
            System.out.println("CartController: Getting cart items for customer ID: " + customerId);
            
            List<CartItem> cartItems = cartService.getCartItems(customerId);
            System.out.println("Successfully retrieved " + cartItems.size() + " cart items");
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            System.err.println("Error in getCartItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving cart items: " + e.getMessage());
        }
    }

    /**
     * Add a product to the cart
     */
    @PostMapping("/{customerId}/add")
    public ResponseEntity<?> addToCart(
            @PathVariable Long customerId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        
        try {
            System.out.println("CartController: Adding item to cart - Customer ID: " + customerId + ", Product ID: " + productId);
            
            // Add item to cart
            CartItem cartItem = cartService.addItemToCart(customerId, productId, quantity);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product added to cart successfully");
            response.put("cartItem", cartItem);
            
            System.out.println("Successfully added product to cart");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in addToCart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding product to cart: " + e.getMessage());
        }
    }

    /**
     * Update the quantity of a cart item
     */
    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<?> updateCartItemQuantity(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        
        try {
            System.out.println("CartController: Updating cart item quantity - Item ID: " + cartItemId + ", Quantity: " + quantity);
            
            // Check if cart item exists
            CartItem updatedItem = cartService.updateCartItemQuantity(cartItemId, quantity);
            
            if (updatedItem == null) {
                System.out.println("Item was removed due to quantity <= 0");
                Map<String, String> response = new HashMap<>();
                response.put("message", "Item removed from cart due to quantity <= 0");
                return ResponseEntity.ok(response);
            }
            
            // Create a simplified response to avoid serialization issues
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedItem.getId());
            response.put("quantity", updatedItem.getQuantity());
            
            if (updatedItem.getProduct() != null) {
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("id", updatedItem.getProduct().getId());
                productMap.put("name", updatedItem.getProduct().getName());
                productMap.put("price", updatedItem.getProduct().getPrice());
                productMap.put("image", updatedItem.getProduct().getImage());
                response.put("product", productMap);
            }
            
            System.out.println("Successfully updated cart item");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating cart item: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating cart item: " + e.getMessage());
        }
    }

    /**
     * Remove an item from the cart
     */
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId) {
        try {
            cartService.removeItemFromCart(cartItemId);
            return ResponseEntity.ok().body("Item removed from cart successfully");
        } catch (Exception e) {
            System.err.println("Error removing item from cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing item from cart: " + e.getMessage());
        }
    }

    /**
     * Clear all items from the customer's cart
     */
    @DeleteMapping("/{customerId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long customerId) {
        try {
            cartService.clearCart(customerId);
            return ResponseEntity.ok().body("Cart cleared successfully");
        } catch (Exception e) {
            System.err.println("Error clearing cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error clearing cart: " + e.getMessage());
        }
    }
}   