package com.project.service;

import com.project.model.Product;
import com.project.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List; // Ensure List is imported
import java.util.Collections; // For returning empty list

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<Product> getAllProducts() {
        // Return only products that are not deleted (deleted = 0)
        return productRepository.findAllActive();
    }

    @Override
    public Page<Product> findWithFilters(Long categoryId, String keyword, Pageable pageable) {
        return productRepository.findWithFilters(categoryId, keyword, pageable);
    }

    @Override
    public Product getProductById(Long id) {
        // Only return product if it's not deleted
        return productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }

    @Override
    public Product createProduct(Product product) {
        // Add any validation or business logic before saving
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);

        // Update fields
        if (productDetails.getName() != null) {
            product.setName(productDetails.getName());
        }
        if (productDetails.getDescription() != null) {
            product.setDescription(productDetails.getDescription());
        }
        if (productDetails.getPrice() != null) {
            product.setPrice(productDetails.getPrice());
        }
        if (productDetails.getImage() != null) {
            product.setImage(productDetails.getImage());
        }
        if (productDetails.getStockQuantity() != null) {
            product.setStockQuantity(productDetails.getStockQuantity());
        }
        if (productDetails.getCategoryId() != null) {
            // Assuming Category handling is managed correctly elsewhere or is simple
            product.setCategoryId(productDetails.getCategoryId());
        }
        // Add other fields to update as necessary

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        // Check if product exists
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }
        // Soft delete by setting deleted = 1
        productRepository.softDeleteById(id);
    }

    @Override
    public List<Product> findProductsByCategoryIdAndKeyword(Long categoryId, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            // Optionally, you could return all products for the category if keyword is empty,
            // or throw an IllegalArgumentException, or return an empty list.
            // For now, let's assume a keyword is expected for a search.
            // If you want to find all products by categoryId, create a separate method or adjust logic.
            // Example: return productRepository.findByCategoryId(categoryId); (if such method exists)
            return productRepository.findByCategoryIdAndKeyword(categoryId, ""); // Or handle as needed
        }
        return productRepository.findByCategoryIdAndKeyword(categoryId, keyword);
    }

    @Override
    public List<Product> findProductsByKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            // Return all products if keyword is empty, or an empty list.
            // Depending on desired behavior. Let's return all products.
            // return productRepository.findAll(); 
            // Or, if a keyword is strictly required for "search", return empty or throw error.
            // For now, let's return an empty list if the keyword is blank.
            return Collections.emptyList();
        }
        return productRepository.findByKeywordIgnoreCase(keyword);
    }
}