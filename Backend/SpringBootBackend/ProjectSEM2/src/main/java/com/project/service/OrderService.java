package com.project.service;

import com.project.model.Order;
import java.util.List;

public interface OrderService {
    Order createOrder(Order order); // Potentially pass DTO or specific parameters
    Order getOrderById(Long id);
    List<Order> getOrdersByCustomerId(Long customerId);
    List<Order> getAllOrders();
    Order updateOrderStatus(Long orderId, String status);
    Order getOrderByPaymentId(String paymentId);
    // Add other business logic methods related to orders if needed
    // For example, cancelOrder, etc.


}