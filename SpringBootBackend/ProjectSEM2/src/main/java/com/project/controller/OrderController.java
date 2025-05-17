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

     private final OrderService orderService; // Use final for constructor injection

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

    // Optional: Exception handlers for this controller
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}