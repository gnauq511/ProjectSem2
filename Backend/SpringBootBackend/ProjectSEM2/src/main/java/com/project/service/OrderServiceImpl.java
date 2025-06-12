package com.project.service;

import com.project.model.*;
import com.project.model.dto.CartItemDTO;
import com.project.model.dto.OrderRequest;
import com.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CartRepository cartRepository;

    @Override
    @Transactional
    public Order createOrder(OrderRequest orderRequest) {
        Customer customer = customerRepository.findById(orderRequest.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + orderRequest.getCustomerId()));

        Address address = addressRepository.findById(orderRequest.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found with ID: " + orderRequest.getAddressId()));

        // 1. Validate stock for all items before making any changes
        for (CartItemDTO itemDTO : orderRequest.getCartItems()) {
            Product product = productRepository.findById(itemDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemDTO.getId()));
            
            int availableStock = getStockForSize(product, itemDTO.getSize());
            if (availableStock < itemDTO.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product " + product.getName() + " (Size: " + itemDTO.getSize() + ")");
            }
        }

        // 2. Create Order and OrderItems
        Order order = new Order();
        order.setCustomer(customer);
        order.setAddress(address);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItemDTO itemDTO : orderRequest.getCartItems()) {
            Product product = productRepository.findById(itemDTO.getId()).get(); // Already checked, so .get() is safe
            
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setSize(itemDTO.getSize());
            orderItem.setOrder(order);
            orderItems.add(orderItem);

            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        // Create and associate the Payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(totalAmount);
        payment.setPaymentDate(LocalDateTime.now());

        String paymentMethod = orderRequest.getPaymentMethod();
        payment.setPaymentMethod(paymentMethod);

        // Set status based on payment method
        if ("PAYPAL".equalsIgnoreCase(paymentMethod)) {
            payment.setStatus("COMPLETED");
            order.setPaymentStatus("COMPLETED");
        } else {
            payment.setStatus("PENDING");
            order.setPaymentStatus("PENDING");
        }

        // Set transaction ID from request or generate a new one for COD
        String transactionId = orderRequest.getTransactionId();
        if (transactionId == null || transactionId.isEmpty()) {
            transactionId = "COD-" + UUID.randomUUID().toString();
        }
        payment.setTransactionId(transactionId);

        // For consistency, also set these on the order itself
        order.setTransactionId(transactionId);
        order.setPaymentMethod(paymentMethod);

        // Add the payment to the order's list of payments
        order.getPayments().add(payment);

        Order savedOrder = orderRepository.save(order);

        // 4. Clear the customer's cart
        cartRepository.findByCustomerId(customer.getId()).ifPresent(cart -> {
            cartRepository.delete(cart);
        });

        return savedOrder;
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }

    @Override
    public List<Order> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);

        // Update stock only when status changes to "SHIPPED" to prevent double-deduction
        if ("SHIPPED".equalsIgnoreCase(status) && !"SHIPPED".equalsIgnoreCase(order.getStatus())) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                int quantity = item.getQuantity();
                String size = item.getSize();

                // Check for sufficient stock before decrementing
                int availableStock = getStockForSize(product, size);
                if (availableStock < quantity) {
                    throw new RuntimeException("Insufficient stock for product " + product.getName() + " (Size: " + size + "). Cannot ship order.");
                }

                updateStock(product, size, -quantity);
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    public Optional<Order> getOrderByTransactionId(String transactionId) {
        return orderRepository.findByTransactionId(transactionId);
    }

    // Helper methods for size-based stock management

    private int getStockForSize(Product product, String size) {
        StockQuantity stock = product.getStockQuantity();
        if (stock == null) return 0;

        switch (size.toUpperCase()) {
            case "S": return stock.getSQuantity();
            case "M": return stock.getMQuantity();
            case "L": return stock.getLQuantity();
            case "XL": return stock.getXlQuantity();
            case "XXL": return stock.getXxlQuantity();
            default: throw new IllegalArgumentException("Invalid size: " + size);
        }
    }

    private void updateStock(Product product, String size, int quantityChange) {
        StockQuantity stock = product.getStockQuantity();
        if (stock == null) {
            throw new IllegalStateException("Product has no stock information.");
        }

        switch (size.toUpperCase()) {
            case "S":
                stock.setSQuantity(stock.getSQuantity() + quantityChange);
                break;
            case "M":
                stock.setMQuantity(stock.getMQuantity() + quantityChange);
                break;
            case "L":
                stock.setLQuantity(stock.getLQuantity() + quantityChange);
                break;
            case "XL":
                stock.setXlQuantity(stock.getXlQuantity() + quantityChange);
                break;
            case "XXL":
                stock.setXxlQuantity(stock.getXxlQuantity() + quantityChange);
                break;
            default:
                throw new IllegalArgumentException("Invalid size: " + size);
        }
    }
}