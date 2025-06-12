package com.project.repository;

import com.project.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find all active products (not deleted)
    @Query("SELECT p FROM Product p WHERE p.deleted = 0")
    List<Product> findAllActive();

    @Query("SELECT p FROM Product p WHERE p.deleted = 0 " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> findWithFilters(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.categoryId = :categoryId AND " +
           "p.deleted = 0 AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> findByCategoryIdAndKeyword(@Param("categoryId") Long categoryId, @Param("keyword") String keyword);

    // New method for keyword-only search with deleted filter
    @Query("SELECT p FROM Product p WHERE p.deleted = 0 AND (" +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> findByKeywordIgnoreCase(@Param("keyword") String keyword);
    
    // Soft delete a product by setting deleted = 1
    @Modifying
    @Query("UPDATE Product p SET p.deleted = 1 WHERE p.id = :id")
    void softDeleteById(@Param("id") Long id);
    
    // Find product by ID only if it's not deleted
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.deleted = 0")
    java.util.Optional<Product> findByIdAndDeletedFalse(@Param("id") Long id);
}
