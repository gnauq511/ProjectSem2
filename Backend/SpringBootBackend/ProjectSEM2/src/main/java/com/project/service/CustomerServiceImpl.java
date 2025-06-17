package com.project.service;

import com.project.dto.AddressDTO;
import com.project.dto.CustomerDetailsDTO;
import com.project.dto.UserDTO;
import com.project.model.Address;
import com.project.model.Customer;
import com.project.model.User; // Assuming User model exists and is linked
import com.project.repository.CustomerRepository;
import com.project.repository.UserRepository; // Assuming UserRepository exists
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository; // Autowire if you need to fetch User

    @Autowired
    public CustomerServiceImpl(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
    }

    @Override
    public Customer getCustomerByUserId(Long userId) {
        return customerRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found for user id: " + userId));
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public Customer createCustomer(Customer customer) {
        // Optional: Add validation, e.g., check if user exists
        if (customer.getUser() != null && customer.getUser().getId() != null) {
            User user = userRepository.findById(customer.getUser().getId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + customer.getUser().getId()));
            customer.setUser(user); // Ensure the user entity is managed
        } else {
            throw new IllegalArgumentException("Customer must be associated with a User.");
        }
        // Optional: Check if a customer already exists for this user
        customerRepository.findByUserId(customer.getUser().getId()).ifPresent(existingCustomer -> {
            throw new IllegalStateException("Customer already exists for user id: " + customer.getUser().getId());
        });
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, Customer customerDetails) {
        Customer customer = getCustomerById(id);

        if (customerDetails.getFirstName() != null) {
            customer.setFirstName(customerDetails.getFirstName());
        }
        if (customerDetails.getLastName() != null) {
            customer.setLastName(customerDetails.getLastName());
        }
        if (customerDetails.getPhone() != null) {
            customer.setPhone(customerDetails.getPhone());
        }
        // Note: Updating User association might be complex and require careful handling
        // For simplicity, we are not updating the User here.

        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }

    @Override
    public CustomerDetailsDTO getCustomerDetailsById(Long id) {
        Customer customer = getCustomerById(id);
        User user = customer.getUser();

        UserDTO userDTO = new UserDTO(
            customer.getFirstName(),
            customer.getLastName(),
            user.getEmail(),
            customer.getPhone()
        );

        List<AddressDTO> addressDTOs = customer.getAddresses().stream()
            .map(this::convertToAddressDTO)
            .collect(Collectors.toList());

        return new CustomerDetailsDTO(userDTO, addressDTOs);
    }

    private AddressDTO convertToAddressDTO(Address address) {
        return new AddressDTO(
            address.getId(),
            address.getStreet(),
            address.getCity(),
            address.getState(),
            address.getZipCode(),
            address.getCountry()
        );
    }
}