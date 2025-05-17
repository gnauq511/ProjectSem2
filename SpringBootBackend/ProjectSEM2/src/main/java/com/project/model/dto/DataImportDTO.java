package com.project.model.dto;

import java.util.List;

public class DataImportDTO {
    private List<CategoryDTO> categories;
    private List<ProductDTO> products;

    public List<CategoryDTO> getCategories() {
        return categories;
    }

    public List<ProductDTO> getProducts() {
        return products;
    }

    public void setCategories(List<CategoryDTO> categories) {
        this.categories = categories;
    }

    public void setProducts(List<ProductDTO> products) {
        this.products = products;
    }
}
