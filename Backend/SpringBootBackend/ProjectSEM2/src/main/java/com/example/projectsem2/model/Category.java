package com.example.projectsem2.model; // Adjust package name

// ... other imports ...
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
// ... other imports like GeneratedValue, GenerationType, List ...


@Entity
@Table(name = "categories") // Or whatever your table name is
public class Category {

    @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY) // If auto-generated
    private Long id;

    private String name;


    // ... existing code ...
    // Getters and setters for id, name, products
}