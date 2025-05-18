package com.project.service;

import com.project.model.Customer;
import java.util.List;

public interface CustomerService {
    Customer getCustomerById(Long id);
    Customer getCustomerByUserId(Long userId);
    List<Customer> getAllCustomers();
    Customer createCustomer(Customer customer);
    Customer updateCustomer(Long id, Customer customerDetails);
    void deleteCustomer(Long id);
}