package com.project.service;

import com.project.model.Category;
import com.project.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
    }

    @Override
    public Category createCategory(Category category) {
        // Find the maximum ID currently in use
        Long maxId = categoryRepository.findAll().stream()
                .map(Category::getId)
                .filter(id -> id != null)
                .max(Long::compareTo)
                .orElse(0L);
        
        // Set the new ID to be one higher than the current maximum
        category.setId(maxId + 1);
        
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id); // This will throw EntityNotFoundException if not found
        
        if (categoryDetails.getName() != null) {
            category.setName(categoryDetails.getName());
        }
        
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        // Check if category exists first
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
