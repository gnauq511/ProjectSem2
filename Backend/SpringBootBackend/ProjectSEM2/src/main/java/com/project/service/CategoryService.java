package com.project.service;
import com.project.model.Category;
import java.util.List;
public interface CategoryService {
    Category getCategoryById(Long id);
    Category createCategory(Category category);
    Category updateCategory(Long id, Category categoryDetails);
    void deleteCategory(Long id);
    List<Category> getAllCategories();
}
