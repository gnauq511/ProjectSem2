package com.project.service;

import com.project.model.Order;
import com.project.model.dto.OrderRequest;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order createOrder(OrderRequest orderRequest);
    Order getOrderById(Long id);
    List<Order> getOrdersByCustomerId(Long customerId);
    List<Order> getAllOrders();
    Order updateOrderStatus(Long orderId, String status);
    Optional<Order> getOrderByTransactionId(String transactionId);
    // Add other business logic methods related to orders if needed
    // For example, cancelOrder, etc.


}