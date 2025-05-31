package com.project.controller;

import com.project.model.*;
import com.project.repository.AddressRepository;
import com.project.repository.CartRepository;
import com.project.repository.PaymentRepository;
import com.project.service.CartService;
import com.project.service.CustomerService;
import com.project.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private PaymentRepository paymentRepository;

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
    public ResponseEntity<?> completeCheckout(
            @PathVariable Long customerId,
            @RequestBody(required = false) Map<String, Object> requestBody) {
        
        // Extract parameters from request body or use defaults
        String paymentMethod = "CASH_ON_DELIVERY";
        String transactionId = null;
        Long addressId = null;
        
        if (requestBody != null) {
            if (requestBody.containsKey("paymentMethod")) {
                paymentMethod = (String) requestBody.get("paymentMethod");
            }
            if (requestBody.containsKey("transactionId")) {
                transactionId = (String) requestBody.get("transactionId");
            }
            if (requestBody.containsKey("addressId")) {
                // Handle potential Integer to Long conversion
                Object addressIdObj = requestBody.get("addressId");
                if (addressIdObj instanceof Integer) {
                    addressId = ((Integer) addressIdObj).longValue();
                } else if (addressIdObj instanceof Long) {
                    addressId = (Long) addressIdObj;
                } else if (addressIdObj instanceof String) {
                    try {
                        addressId = Long.parseLong((String) addressIdObj);
                    } catch (NumberFormatException e) {
                        System.out.println("Invalid addressId format: " + addressIdObj);
                    }
                }
            }
        }
        // Log the received parameters for debugging
        System.out.println("Processing checkout - Customer ID: " + customerId + ", Payment Method: " + paymentMethod);
        
        System.out.println("Using payment method: " + paymentMethod);
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

            // Get customer's address
            Address address;
            
            if (addressId != null) {
                System.out.println("[CheckoutController] Attempting to find address with ID: " + addressId + " for customer ID: " + customerId);
                // Get customer's address by addressId
                Optional<Address> addressOptional = addressRepository.findById(addressId);
                if (addressOptional.isPresent()) {
                    address = addressOptional.get();
                    // Verify that the address belongs to the customer
                    if (!address.getCustomer().getId().equals(customerId)) {
                        System.out.println("[CheckoutController] Address does not belong to customer ID: " + customerId);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Address does not belong to the customer");
                    }
                } else {
                    System.out.println("[CheckoutController] Address not found with ID: " + addressId + ", using default address");
                    // Use default address
                    List<Address> addresses = customer.getAddresses();
                    if (addresses == null || addresses.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Customer has no addresses");
                    }
                    address = addresses.get(0);
                }
            } else {
                System.out.println("[CheckoutController] No address ID provided, using default address");
                // Use default address
                List<Address> addresses = customer.getAddresses();
                if (addresses == null || addresses.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Customer has no addresses");
                }
                address = addresses.get(0);
            }
            
            System.out.println("[CheckoutController] Using address ID: " + address.getId());

            System.out.println("[CheckoutController] Attempting to get cart items for customer ID: " + customerId);
            // Get cart items
            List<CartItem> cartItems = cartService.getCartItems(customerId);
            if (cartItems.isEmpty()) {
                System.out.println("[CheckoutController] Cart is empty for customer ID: " + customerId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cart is empty");
            }
            System.out.println("[CheckoutController] Found " + cartItems.size() + " cart items.");

            System.out.println("[CheckoutController] Attempting to clear cart.");
            // Clear the cart (only checked out items)
            cartService.clearCart(customerId);
            System.out.println("[CheckoutController] Cart cleared successfully for customer ID: " + customerId);

            // Prepare order details for creation
            Order newOrderObjectToCreate = new Order();
            newOrderObjectToCreate.setCustomer(customer);
            newOrderObjectToCreate.setShippingAddress(address);
            // OrderServiceImpl will set default status (e.g., "PENDING"), orderDate, totalAmount, and process items.

            List<OrderItem> orderItemsList = new ArrayList<>();
            for (CartItem cartItem : cartItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setProduct(cartItem.getProduct()); // Product reference
                orderItem.setQuantity(cartItem.getQuantity()); // Quantity
                // The OrderService will handle setting the price on the OrderItem
                // and linking the OrderItem back to the Order.
                orderItem.setOrder(newOrderObjectToCreate); // Establish relationship from OrderItem side
                orderItemsList.add(orderItem);
            }
            newOrderObjectToCreate.setOrderItems(orderItemsList);

            System.out.println("[CheckoutController] Attempting to create order via OrderService with prepared Order object.");
            Order order = orderService.createOrder(newOrderObjectToCreate); // Call the existing service method

            // OrderServiceImpl.createOrder is expected to throw an exception on failure.
            // If we reach here, the order was created successfully.
            System.out.println("[CheckoutController] Order created successfully with ID: " + order.getId());

            // Create a payment record
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalAmount());
            payment.setPaymentMethod(paymentMethod);
            payment.setStatus("PENDING"); // Set status to PENDING for COD
            payment.setPaymentDate(LocalDateTime.now());
            
            // Set transaction ID based on the provided value or generate one for COD
            String finalTransactionId = transactionId;
            if (finalTransactionId == null || finalTransactionId.isEmpty()) {
                finalTransactionId = "COD_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000);
            }
            payment.setTransactionId(finalTransactionId);
            System.out.println("Setting transaction ID to " + finalTransactionId + " for payment");

            // Save the payment record to the database
            Payment savedPayment = paymentRepository.save(payment);
            System.out.println("Payment saved to database with ID: " + savedPayment.getId());
            
            // Add payment to order
            List<Payment> payments = new ArrayList<>();
            payments.add(savedPayment);
            order.setPayments(payments);

            // Return the created order
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order created successfully");
            response.put("order", order);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("[CheckoutController] Exception during checkout: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during checkout: " + e.getMessage());
        }
    }
}
