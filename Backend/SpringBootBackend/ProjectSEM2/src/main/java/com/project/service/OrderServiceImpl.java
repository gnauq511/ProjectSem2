package com.project.service;

import com.project.model.Customer;
import com.project.model.Order;
import com.project.model.OrderItem;
import com.project.model.Product;
import com.project.repository.CustomerRepository;
import com.project.repository.OrderRepository;
import com.project.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final com.project.repository.PaymentRepository paymentRepository; // Added PaymentRepository

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository,
                            CustomerRepository customerRepository,
                            ProductRepository productRepository,
                            com.project.repository.PaymentRepository paymentRepository) { // Added PaymentRepository
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository; // Added PaymentRepository
    }

    @Override
    @Transactional
    public Order createOrder(Order order) {
        // 1. Validate Customer
        Customer customer = customerRepository.findById(order.getCustomer().getId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + order.getCustomer().getId()));
        order.setCustomer(customer);

        // 2. Set Order Date
        order.setOrderDate(LocalDateTime.now());

        // 3. Process OrderItems: Validate products, update stock, calculate total
        double totalAmount = 0.0;
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = productRepository.findById(item.getProduct().getId())
                        .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + item.getProduct().getId()));

                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
                }

                // Update product stock
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);

                item.setProduct(product); // Ensure managed product entity is set
                item.setPrice(product.getPrice()); // Set price at the time of order
                item.setOrder(order); // Set bidirectional relationship
                totalAmount += item.getQuantity() * item.getPrice().doubleValue();
            }
        } else {
            throw new IllegalArgumentException("Order must contain at least one item.");
        }

        order.setTotalAmount(BigDecimal.valueOf(totalAmount));
        // Set default status if not provided
        if (order.getStatus() == null) {
            order.setStatus("PENDING"); // Or some default status
        }

        return orderRepository.save(order);
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
    }

    @Override
    public List<Order> getOrdersByCustomerId(Long customerId) {
        // Ensure customer exists if you want to throw an error, or just return empty list
        customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + customerId));
        return orderRepository.findByCustomerId(customerId);
    }

    @Override
    @Transactional
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        
        // Force initialization of lazy-loaded collections
        for (Order order : orders) {
            // Access the collections to initialize them
            if (order.getCustomer() != null) {
                order.getCustomer().getFirstName(); // Access to initialize
            }
            if (order.getShippingAddress() != null) {
                order.getShippingAddress().getStreet(); // Access to initialize
            }
            if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                order.getOrderItems().size(); // Access to initialize
                // Initialize each product in order items
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct() != null) {
                        item.getProduct().getName(); // Access to initialize
                    }
                }
            }
            if (order.getPayments() != null && !order.getPayments().isEmpty()) {
                order.getPayments().size(); // Access to initialize
            }
        }
        
        return orders;
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + orderId));

        // Validate status (you might want to use an enum or constants instead)
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be empty");
        }

        // List of valid statuses - could be moved to an enum in a real application
        List<String> validStatuses = List.of("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Valid statuses are: " + validStatuses);
        }

        order.setStatus(status.toUpperCase());
        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true) // Good practice for read operations
    public Order getOrderByPaymentId(String paymentId) {
        if (paymentId == null || paymentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Payment ID cannot be null or empty.");
        }
        com.project.model.Payment payment = paymentRepository.findByTransactionId(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found with transaction ID: " + paymentId));
        
        Order order = payment.getOrder();
        if (order == null) {
            // This case should ideally not happen if data integrity is maintained
            throw new EntityNotFoundException("Order not found for payment with transaction ID: " + paymentId);
        }
        // Initialize lazy-loaded collections if needed, similar to getAllOrders()
        if (order.getCustomer() != null) {
            order.getCustomer().getFirstName(); 
        }
        if (order.getShippingAddress() != null) {
            order.getShippingAddress().getStreet(); 
        }
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            order.getOrderItems().size(); 
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null) {
                    item.getProduct().getName(); 
                }
            }
        }
        // No need to initialize order.getPayments() here as we came from a payment
        return order;
    }
}