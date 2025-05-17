package com.project.service;

import com.project.model.Product;
import java.util.List;

public interface ProductService {
    List<Product> getAllProducts();
    Product getProductById(Long id);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product productDetails);
    void deleteProduct(Long id);
    List<Product> findProductsByCategoryIdAndKeyword(Long categoryId, String keyword); // New method
    // Add any other business logic methods related to products if needed
}