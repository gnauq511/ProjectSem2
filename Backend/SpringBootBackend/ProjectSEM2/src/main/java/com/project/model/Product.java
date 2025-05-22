package com.project.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal; // Added for price

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Assuming auto-increment, diagram shows INTEGER
    @Column(name = "product_id") // Matches diagram product_id
    private Long id;

    private String name;

    @Column(length = 1000) // Diagram description is TEXT
    private String description;

    @Column(precision = 10, scale = 2) // Matches diagram price DECIMAL
    private BigDecimal price;

    @Column(name = "image_url") // Main product image
    private String image;
    
    @Column(name = "image_view_2") // Second view of the product
    private String imageView2;
    
    @Column(name = "image_view_3") // Third view of the product
    private String imageView3;
    
    @Column(name = "image_view_4") // Fourth view of the product
    private String imageView4;

    @Column(name = "stock_quantity") // New field from diagram
    private Integer stockQuantity;

    // Category relationship - simplified to avoid circular dependencies
    @Column(name = "category_id")
    private Long categoryId;
    
    @Transient
    private String categoryName;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
    
    public String getImageView2() {
        return imageView2;
    }

    public void setImageView2(String imageView2) {
        this.imageView2 = imageView2;
    }

    public String getImageView3() {
        return imageView3;
    }

    public void setImageView3(String imageView3) {
        this.imageView3 = imageView3;
    }

    public String getImageView4() {
        return imageView4;
    }

    public void setImageView4(String imageView4) {
        this.imageView4 = imageView4;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
