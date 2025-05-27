package com.project.service;

import com.project.model.Cart;
import com.project.model.Customer;
import com.project.model.User;
import com.project.model.dto.ResultUser;
import com.project.repository.CartRepository;
import com.project.repository.CustomerRepository;
import com.project.repository.UserRepository;
import com.project.util.PasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private CartRepository cartRepository;

    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
         if (userRepository.findByEmail(user.getEmail()).isPresent()) {
             throw new RuntimeException("Email already exists");
         }

        String encryptedPass
                = PasswordEncryptor.encryptPasswordMD5(user.getPassword());
        user.setPassword(encryptedPass);

        return userRepository.save(user);
    }

    @Transactional
    public ResultUser loginUser(User user) {

        ResultUser resultUser = new ResultUser();

        Optional<User> existingUser
                = userRepository.findByUsername(user.getUsername());

        if(existingUser.isPresent()) {
            String existingPassword = existingUser.get().getPassword();

            if(PasswordEncryptor.encryptPasswordMD5(user.getPassword())
                    .equals(existingPassword)) {

                User loggedInUser = existingUser.get();
                User userResponse = new User(
                        loggedInUser.getId(),
                        loggedInUser.getUsername(),
                        loggedInUser.getRole()
                );
                
                // Find the customer associated with this user
                Optional<Customer> customerOpt = customerRepository.findByUser_Id(loggedInUser.getId());
                Customer customer;
                
                if (customerOpt.isPresent()) {
                    customer = customerOpt.get();
                } else {
                    // Create a new customer record for this user if one doesn't exist
                    customer = new Customer();
                    customer.setUser(loggedInUser);
                    customer.setFirstName(loggedInUser.getUsername()); // Default first name
                    customer.setLastName(""); // Empty last name
                    customer = customerRepository.save(customer);
                    
                    // Create a cart for the new customer
                    Cart cart = new Cart();
                    cart.setCustomer(customer);
                    cart.setCreatedAt(LocalDateTime.now());
                    cartRepository.save(cart);
                }
                
                // Create a custom field to store the customer ID
                userResponse.setCustomerId(customer.getId());
                
                resultUser.setResult(true);
                resultUser.setData(userResponse);

                return resultUser;
            }
        }

        resultUser.setResult(false);
        resultUser.setData(null);

        return resultUser;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(User user) {
        User existingUser = getUserById(user.getId());
        if (user.getUsername() != null) {
            existingUser.setUsername(user.getUsername());
        }
        
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(PasswordEncryptor.encryptPasswordMD5(user.getPassword()));
        }
        
        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        getUserById(id);
        userRepository.deleteById(id);
    }
}
