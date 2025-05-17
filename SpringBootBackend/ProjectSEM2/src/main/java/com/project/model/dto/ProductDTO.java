package com.project.model.dto;

public class ProductDTO {
    private Long id;
    private Long categories; // đây là categoryId
    private String name;
    private String description;
    private String price;
    private String image;


    public Long getId() {
        return id;
    }

    public Long getCategories() {
        return categories;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getPrice() {
        return price;
    }

    public String getImage() {
        return image;
    }



    public void setId(Long id) {
        this.id = id;
    }

    public void setCategories(Long categories) {
        this.categories = categories;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public void setImage(String image) {
        this.image = image;
    }

}
