package com.project.controller;

import com.project.model.*;
import com.project.model.dto.CartItemDTO;
import com.project.model.dto.OrderRequest;
import com.project.repository.AddressRepository;
import com.project.repository.CartRepository;

import com.project.service.CartService;
import com.project.service.CustomerService;
import com.project.service.OrderService;
import com.project.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"})
public class CheckoutController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CartRepository cartRepository;


    @Autowired
    private EmailService emailService;

    /**
     * Create a new address for a customer
     */
    @PostMapping("/{customerId}/address")
    public ResponseEntity<?> createAddress(
            @PathVariable Long customerId,
            @RequestBody Address address) {
        try {
            System.out.println("[CheckoutController] Attempting to find customer with ID: " + customerId);
            // Find the customer
            Customer customer = customerService.getCustomerById(customerId);
            if (customer == null) {
                System.out.println("[CheckoutController] Customer not found with ID: " + customerId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found with ID: " + customerId);
            }
            System.out.println("[CheckoutController] Customer found: " + customer.getFirstName());

            // Set the customer for this address
            address.setCustomer(customer);

            // Save the address
            Address savedAddress = addressRepository.save(address);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedAddress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating address: " + e.getMessage());
        }
    }

    /**
     * Get all addresses for a customer
     */
    @GetMapping("/{customerId}/addresses")
    public ResponseEntity<?> getAddresses(@PathVariable Long customerId) {
        try {
            System.out.println("[CheckoutController] Attempting to find customer with ID: " + customerId);
            // Find the customer
            Customer customer = customerService.getCustomerById(customerId);
            if (customer == null) {
                System.out.println("[CheckoutController] Customer not found with ID: " + customerId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Customer not found with ID: " + customerId);
            }
            System.out.println("[CheckoutController] Customer found: " + customer.getFirstName());

            // Get customer's addresses
            List<Address> addresses = customer.getAddresses();
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving addresses: " + e.getMessage());
        }
    }

    /**
     * Process checkout and create an order
     */
    @PostMapping("/{customerId}/complete")
    @Transactional
    public ResponseEntity<?> completeCheckout(
            @PathVariable Long customerId,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        
        String paymentMethod = "CASH_ON_DELIVERY";
        String transactionId = null;
        Long addressId = null;
        
        if (requestBody != null) {
            paymentMethod = (String) requestBody.getOrDefault("paymentMethod", "CASH_ON_DELIVERY");
            transactionId = (String) requestBody.get("transactionId");
            Object addressIdObj = requestBody.get("addressId");
            if (addressIdObj instanceof Integer) {
                addressId = ((Integer) addressIdObj).longValue();
            } else if (addressIdObj instanceof Long) {
                addressId = (Long) addressIdObj;
            } else if (addressIdObj instanceof String) {
                try {
                    addressId = Long.parseLong((String) addressIdObj);
                } catch (NumberFormatException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid addressId format.");
                }
            }
        }

        try {
            Customer customer = customerService.getCustomerById(customerId);
            if (customer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found with ID: " + customerId);
            }

            Address address;
            if (addressId != null) {
                final Long finalAddressId = addressId;
                address = addressRepository.findById(finalAddressId)
                        .orElseThrow(() -> new RuntimeException("Address not found with ID: " + finalAddressId));
                if (!address.getCustomer().getId().equals(customerId)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Address does not belong to the customer.");
                }
            } else {
                address = customer.getAddresses().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("Customer has no addresses."));
            }

            List<CartItem> cartItems = cartService.getCartItems(customerId);
            if (cartItems.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cart is empty.");
            }

            OrderRequest orderRequest = new OrderRequest();
            orderRequest.setCustomerId(customerId);
            orderRequest.setAddressId(address.getId());
            orderRequest.setPaymentMethod(paymentMethod);
            
            // The service will now handle transaction ID generation if null
            orderRequest.setTransactionId(transactionId);

            List<CartItemDTO> cartItemDTOs = cartItems.stream()
                    .map(cartItem -> {
                        CartItemDTO dto = new CartItemDTO();
                        dto.setId(cartItem.getProduct().getId());
                        dto.setQuantity(cartItem.getQuantity());
                        dto.setPrice(cartItem.getProduct().getPrice());
                        return dto;
                    })
                    .collect(Collectors.toList());
            orderRequest.setCartItems(cartItemDTOs);

            // Create the order using the service
            Order createdOrder = orderService.createOrder(orderRequest);

            // Clear the cart only after the order is successfully created
            cartService.clearCart(customerId);

            // Send email notification for Cash on Delivery
            if ("CASH_ON_DELIVERY".equals(paymentMethod)) {
                StringBuilder emailBody = new StringBuilder();
                emailBody.append("Dear ").append(customer.getFirstName()).append(",<br/><br/>");
                emailBody.append("Thank you for your order! Your Cash on Delivery order #").append(createdOrder.getId()).append(" has been placed successfully. You will pay upon delivery.<br/><br/>");
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
                emailBody.append("We will notify you once your order has been shipped.<br/><br/>");
                emailBody.append("Thanks,<br/>Your Store Team");

                emailService.sendHtmlEmail(
                    customer.getUser().getEmail(),
                    "Order Placed - Order #" + createdOrder.getId() + " (Cash on Delivery)",
                    emailBody.toString()
                );
            }

            return ResponseEntity.ok(createdOrder);

        } catch (Exception e) {
            System.err.println("Error completing checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error completing checkout: " + e.getMessage());
        }
    }
}
