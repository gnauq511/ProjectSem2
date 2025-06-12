package com.project.controller;

import com.paypal.api.payments.Links;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.PayPalRESTException;
import com.project.model.*;
import com.project.model.dto.CartItemDTO;
import com.project.model.dto.OrderRequest;
import com.project.service.CartService;
import com.project.service.CustomerService;
import com.project.service.OrderService;
import com.project.service.PayPalService;
import com.project.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Autowired
    private EmailService emailService;

    public static final String SUCCESS_URL = "http://localhost:3000/payment-success?method=paypal";
    public static final String CANCEL_URL = "http://localhost:3000/payment/cancel";
    

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestParam("customerId") Long customerId,
            @RequestParam("addressId") Long addressId) {
        try {
            Customer customer = customerService.getCustomerById(customerId);
            if (customer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found with ID: " + customerId);
            }
            List<CartItem> cartItems = cartService.getCartItems(customerId);
            if (cartItems.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cart is empty");
            }
            BigDecimal total = BigDecimal.ZERO;
            for (CartItem item : cartItems) {
                BigDecimal itemPrice = item.getProduct().getPrice();
                BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
            }

            Payment payment = paypalService.createPayment(
                    total, 
                    "USD", 
                    "paypal", 
                    "sale",
                    "Payment for order",
                    CANCEL_URL + "?customerId=" + customerId,
                    // Include paymentId in success URL for easier tracking
                    SUCCESS_URL + "&customerId=" + customerId + "&addressId=" + addressId
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
                // Idempotency Check: Check if an order with this transaction ID already exists
                Optional<Order> existingOrderOpt = orderService.getOrderByTransactionId(payment.getId());
                if (existingOrderOpt.isPresent()) {
                    System.out.println("[PayPalController] Order with transaction ID " + payment.getId() + " already exists. Returning existing order.");
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Payment already processed");
                    response.put("order", existingOrderOpt.get());
                    return ResponseEntity.ok(response);
                }

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

                // Create OrderRequest DTO
                OrderRequest orderRequest = new OrderRequest();
                orderRequest.setCustomerId(customerId);
                orderRequest.setAddressId(addressId);
                orderRequest.setPaymentMethod("PAYPAL");
                orderRequest.setTransactionId(payment.getId());

                List<CartItemDTO> cartItemDTOs = cartItems.stream()
                        .map(cartItem -> {
                            CartItemDTO dto = new CartItemDTO();
                            dto.setId(cartItem.getProduct().getId());
                            dto.setQuantity(cartItem.getQuantity());
                            dto.setPrice(cartItem.getProduct().getPrice());
                            dto.setSize(cartItem.getSize());
                            return dto;
                        })
                        .collect(Collectors.toList());
                orderRequest.setCartItems(cartItemDTOs);

                // Create the order using the service
                Order createdOrder = orderService.createOrder(orderRequest);

                // Build HTML email content
                StringBuilder emailBody = new StringBuilder();
                emailBody.append("Dear ").append(customer.getFirstName()).append(",<br/><br/>");
                emailBody.append("Your payment for order #").append(createdOrder.getId()).append(" was successful! Your order will be processed shortly.<br/><br/>");

                // Add order items table
                emailBody.append("<table border='1' cellpadding='5' cellspacing='0'>");
                emailBody.append("<thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th></tr></thead>");
                emailBody.append("<tbody>");
                for (OrderItem item : createdOrder.getOrderItems()) {
                    BigDecimal itemSubtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    emailBody.append("<tr>");
                    emailBody.append("<td>").append(item.getProduct().getName()).append("</td>");
                    emailBody.append("<td>$").append(String.format("%.2f", item.getPrice())).append("</td>");
                    emailBody.append("<td>").append(item.getQuantity()).append("</td>");
                    emailBody.append("<td>$").append(String.format("%.2f", itemSubtotal)).append("</td>");
                    emailBody.append("</tr>");
                }
                emailBody.append("</tbody>");
                emailBody.append("</table><br/>");

                emailBody.append("Total Amount: <b>$").append(String.format("%.2f", createdOrder.getTotalAmount())).append("</b><br/><br/>");
                emailBody.append("Thank you for your purchase!<br/><br/>");
                emailBody.append("Best regards,<br/>");
                emailBody.append("The E-commerce Team");

                // Send email notification with HTML content
                emailService.sendHtmlEmail(
                    customer.getUser().getEmail(),
                    "Payment Successful - Order #" + createdOrder.getId(),
                    emailBody.toString()
                );

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
