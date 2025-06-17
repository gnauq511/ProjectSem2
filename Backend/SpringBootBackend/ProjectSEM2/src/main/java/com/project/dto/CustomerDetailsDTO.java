package com.project.dto;

import java.util.List;

public class CustomerDetailsDTO {
    private UserDTO user;
    private List<AddressDTO> addresses;

    public CustomerDetailsDTO(UserDTO user, List<AddressDTO> addresses) {
        this.user = user;
        this.addresses = addresses;
    }

    // Getters and Setters
    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public List<AddressDTO> getAddresses() {
        return addresses;
    }

    public void setAddresses(List<AddressDTO> addresses) {
        this.addresses = addresses;
    }
}
