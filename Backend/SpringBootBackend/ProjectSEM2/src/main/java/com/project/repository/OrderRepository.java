package com.project.repository;

import com.project.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
        @Query("SELECT o FROM Order o JOIN FETCH o.orderItems oi JOIN FETCH oi.product p WHERE o.customer.id = :customerId")
    List<Order> findByCustomerId(Long customerId);
    Optional<Order> findByTransactionId(String transactionId);
}
