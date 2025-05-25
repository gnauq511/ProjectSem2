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

    public ResultUser loginUser(User user) {

        ResultUser resultUser = new ResultUser();

        Optional<User> existingUser
                = userRepository.findByUsername(user.getUsername());

        if(existingUser.isPresent()) {
            String existingPassword = existingUser.get().getPassword();

            if(PasswordEncryptor.encryptPasswordMD5(user.getPassword())
                    .equals(existingPassword)) {

                User loggedInUser = existingUser.get();
                resultUser.setResult(true);
                resultUser.setData(new User(
                        loggedInUser.getId(),
                        loggedInUser.getUsername(),
                        loggedInUser.getRole()
                ));

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
