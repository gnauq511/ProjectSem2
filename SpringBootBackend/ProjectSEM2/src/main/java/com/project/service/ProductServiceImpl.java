package com.project.service;

import com.project.model.Product;
import com.project.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List; // Ensure List is imported

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
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
        if (productDetails.getCategory() != null) {
            // Assuming Category handling is managed correctly elsewhere or is simple
            product.setCategory(productDetails.getCategory());
        }
        // Add other fields to update as necessary

        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = getProductById(id); // Ensures product exists before attempting delete
        productRepository.delete(product);
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
}