package com.project.controller;

import com.project.service.OrderService;
import com.project.model.Order;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

     private final OrderService orderService;

     @Autowired
     public OrderController(OrderService orderService) { // Constructor injection
         this.orderService = orderService;
     }

     @PostMapping
     public ResponseEntity<?> createOrder(@RequestBody Order order) {
         try {
             Order createdOrder = orderService.createOrder(order);
             return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
         } catch (EntityNotFoundException e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
         } catch (IllegalArgumentException e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
         }
     }

     @GetMapping("/{id}")
     public ResponseEntity<?> getOrderById(@PathVariable Long id) {
         try {
             Order order = orderService.getOrderById(id);
             return ResponseEntity.ok(order);
         } catch (EntityNotFoundException e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
         }
     }

     @GetMapping("/customer/{customerId}")
     public ResponseEntity<?> getOrdersByCustomerId(@PathVariable Long customerId) {
         try {
             List<Order> orders = orderService.getOrdersByCustomerId(customerId);
             return ResponseEntity.ok(orders);
         } catch (EntityNotFoundException e) { // If customer not found in service
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
         }
     }

     @GetMapping
     public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        System.out.println("Fetched " + orders.size() + " orders");
        // Debug output to see what's being returned
        for (Order order : orders) {
            System.out.println("Order ID: " + order.getId() + ", Status: " + order.getStatus());
            if (order.getCustomer() != null) {
                System.out.println("  Customer: " + order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName());
            }
            if (order.getOrderItems() != null) {
                System.out.println("  Items: " + order.getOrderItems().size());
            }
        }
        return ResponseEntity.ok(orders);
    }

     @PatchMapping("/{id}/status")
     public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
         try {
             Order updatedOrder = orderService.updateOrderStatus(id, status);
             return ResponseEntity.ok(updatedOrder);
         } catch (EntityNotFoundException e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
         } catch (IllegalArgumentException e) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
         }
     }

    @GetMapping("/by-payment/{paymentId}")
    public ResponseEntity<?> getOrderByPaymentId(@PathVariable String paymentId) {
        try {
            Order order = orderService.getOrderByPaymentId(paymentId);
            return ResponseEntity.ok(order);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Generic exception handler for other potential issues
            System.err.println("Error fetching order by payment ID " + paymentId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching order by payment ID: " + e.getMessage());
        }
    }

     @ExceptionHandler(EntityNotFoundException.class)
     public ResponseEntity<String> handleEntityNotFound(EntityNotFoundException ex) {
         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
     }

     @ExceptionHandler(IllegalArgumentException.class)
     public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
     }
}