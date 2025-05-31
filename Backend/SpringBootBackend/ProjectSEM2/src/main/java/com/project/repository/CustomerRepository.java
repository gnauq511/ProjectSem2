package com.project.repository;

import com.project.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUserId(Long id);
    boolean existsByUserId(Long id);

    // Add new methods that use the correct field name
    Optional<Customer> findByUser_Id(Long userId);
    boolean existsByUser_Id(Long userId);
}
