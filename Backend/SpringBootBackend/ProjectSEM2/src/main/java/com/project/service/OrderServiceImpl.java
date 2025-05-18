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

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository,
                            CustomerRepository customerRepository,
                            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
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
}