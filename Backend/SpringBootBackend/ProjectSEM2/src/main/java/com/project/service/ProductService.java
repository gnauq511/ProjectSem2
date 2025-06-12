package com.project.service;

import com.project.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Page<Product> findWithFilters(Long categoryId, String keyword, Pageable pageable);
    Product getProductById(Long id);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product productDetails);
    void deleteProduct(Long id);
    List<Product> findProductsByCategoryIdAndKeyword(Long categoryId, String keyword);
    List<Product> findProductsByKeyword(String keyword); 
}