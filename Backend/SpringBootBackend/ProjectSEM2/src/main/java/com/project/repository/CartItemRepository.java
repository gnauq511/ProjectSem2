package com.project.repository;

import com.project.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    
    Optional<CartItem> findByCartIdAndProductIdAndSize(Long cartId, Long productId, String size);

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    
    @Transactional
    void deleteByCartId(Long cartId);
}