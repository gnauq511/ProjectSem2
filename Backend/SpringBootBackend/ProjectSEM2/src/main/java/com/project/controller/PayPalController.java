package com.project.controller;

import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import com.project.model.*;
import com.project.service.CartService;
import com.project.service.CustomerService;
import com.project.service.OrderService;
import com.project.service.PayPalService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/paypal")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"})
public class PayPalController {

    @Autowired
    private PayPalService paypalService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private CartService cartService;

    public static final String SUCCESS_URL = "http://localhost:3000/payment/success";
    public static final String CANCEL_URL = "http://localhost:3000/payment/cancel";
    
    // Debug log for PayPal callbacks
    private void logPayPalParameters(String method, Object... params) {
        StringBuilder sb = new StringBuilder();
        sb.append("[PayPalController] ").append(method).append(" called with parameters: ");
        for (Object param : params) {
            sb.append(param).append(", ");
        }
        System.out.println(sb.toString());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestParam("customerId") Long customerId,
            @RequestParam("addressId") Long addressId) {
        try {
            // Find the customer
            Customer customer = customerService.getCustomerById(customerId);
            if (customer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found with ID: " + customerId);
            }
            
            // Get cart items
            List<CartItem> cartItems = cartService.getCartItems(customerId);
            if (cartItems.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cart is empty");
            }
            
            // Calculate total amount
            BigDecimal total = BigDecimal.ZERO;
            for (CartItem item : cartItems) {
                BigDecimal itemPrice = item.getProduct().getPrice();
                BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
            }
            
            // Create temporary order in session or database
            // For this example, we'll just store the order ID in the success URL
            
            // Create PayPal payment
            Payment payment = paypalService.createPayment(
                    total, 
                    "USD", 
                    "paypal", 
                    "sale",
                    "Payment for order",
                    CANCEL_URL + "?customerId=" + customerId,
                    // Include paymentId in success URL for easier tracking
                    SUCCESS_URL + "?customerId=" + customerId + "&addressId=" + addressId
            );
            
            System.out.println("[PayPalController] Created payment with ID: " + payment.getId());
            
            for (Links link : payment.getLinks()) {
                if (link.getRel().equals("approval_url")) {
                    Map<String, String> response = new HashMap<>();
                    response.put("redirectUrl", link.getHref());
                    response.put("paymentId", payment.getId());
                    return ResponseEntity.ok(response);
                }
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create PayPal payment");
            
        } catch (PayPalRESTException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating PayPal payment: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing request: " + e.getMessage());
        }
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completePayment(
            @RequestParam(value = "paymentId", required = true) String paymentId,
            @RequestParam(value = "PayerID", required = true) String payerId,
            @RequestParam(value = "customerId", required = true) Long customerId,
            @RequestParam(value = "addressId", required = true) Long addressId) {
        
        System.out.println("\n\n[PayPalController] completePayment called with parameters:");
        System.out.println("paymentId: " + paymentId);
        System.out.println("PayerID: " + payerId);
        System.out.println("customerId: " + customerId);
        System.out.println("addressId: " + addressId + "\n");
        try {
            // Check if PayerID is provided
            if (payerId == null || payerId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("PayerID is required to complete the payment");
            }
            
            // Execute PayPal payment
            System.out.println("[PayPalController] Executing payment with ID: " + paymentId + " and PayerID: " + payerId);
            Payment payment = paypalService.executePayment(paymentId, payerId);
            
            if (payment.getState().equals("approved")) {
                // Find the customer
                Customer customer = customerService.getCustomerById(customerId);
                if (customer == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Customer not found with ID: " + customerId);
                }
                
                // Get cart items
                List<CartItem> cartItems = cartService.getCartItems(customerId);
                if (cartItems.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Cart is empty");
                }
                
                // Create order
                Order newOrder = new Order();
                newOrder.setCustomer(customer);
                
                // Find shipping address
                Optional<Address> addressOpt = customer.getAddresses().stream()
                        .filter(addr -> addr.getId().equals(addressId))
                        .findFirst();
                
                if (addressOpt.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Address not found with ID: " + addressId);
                }
                
                newOrder.setShippingAddress(addressOpt.get());
                
                // Create order items
                List<OrderItem> orderItems = new ArrayList<>();
                for (CartItem cartItem : cartItems) {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setProduct(cartItem.getProduct());
                    orderItem.setQuantity(cartItem.getQuantity());
                    orderItem.setOrder(newOrder);
                    orderItems.add(orderItem);
                }
                newOrder.setOrderItems(orderItems);
                
                // Create order
                Order createdOrder = orderService.createOrder(newOrder);
                
                // Create payment record
                com.project.model.Payment orderPayment = new com.project.model.Payment();
                orderPayment.setOrder(createdOrder);
                orderPayment.setAmount(createdOrder.getTotalAmount());
                orderPayment.setPaymentMethod("PAYPAL");
                orderPayment.setStatus("COMPLETED");
                orderPayment.setPaymentDate(LocalDateTime.now());
                orderPayment.setTransactionId(payment.getId()); // Use PayPal payment ID
                
                // Add payment to order
                List<com.project.model.Payment> payments = new ArrayList<>();
                payments.add(orderPayment);
                createdOrder.setPayments(payments);
                
                // Clear cart
                cartService.clearCart(customerId);
                
                // Return success response
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Payment completed successfully");
                response.put("order", createdOrder);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Payment not approved");
            }
        } catch (PayPalRESTException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error executing PayPal payment: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing request: " + e.getMessage());
        }
    }
}
