package com.project.service;

import com.project.model.User;
import com.project.model.dto.ResultUser;
import com.project.repository.UserRepository;
import com.project.util.PasswordEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists (you would need to add this method to the repository)
        // if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        //     throw new RuntimeException("Email already exists");
        // }

        //encrypt password
        String encryptedPass
                = PasswordEncryptor.encryptPasswordMD5(user.getPassword());
        user.setPassword(encryptedPass);

        return userRepository.save(user);
    }

    public ResultUser loginUser(User user) {

        ResultUser resultUser = new ResultUser();

        Optional<User> existingUser
                = userRepository.findByUsername(user.getUsername());

        if(existingUser.isPresent()) {
            String existingPassword = existingUser.get().getPassword();

            if(PasswordEncryptor.encryptPasswordMD5(user.getPassword())
                    .equals(existingPassword)) {

                resultUser.setResult(true);
                resultUser.setData(new User(
                        existingUser.get().getId(),
                        existingUser.get().getUsername()
                ));

                return resultUser;
            }
        }

        //login failed
        resultUser.setResult(false);
        resultUser.setData(null);

        return resultUser;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(User user) {
        // Check if user exists
        User existingUser = getUserById(user.getId());
        
        // Update fields - only update if not null
        if (user.getUsername() != null) {
            existingUser.setUsername(user.getUsername());
        }
        
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        
        // If password is provided, encrypt it
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(PasswordEncryptor.encryptPasswordMD5(user.getPassword()));
        }
        
        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        // Check if user exists
        getUserById(id);
        userRepository.deleteById(id);
    }
}
