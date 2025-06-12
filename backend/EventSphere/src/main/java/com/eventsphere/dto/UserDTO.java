package com.eventsphere.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserDTO {
    private Long id;
    @NotBlank(message = "O username é obrigatório")
    private String username;
    @NotBlank(message = "O nome é obrigatório")
    private String name;
    private Set<String> roles = new HashSet<>();
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
    private LocalDateTime registerDate;
    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    private String password;    private String photo;

    // Construtor padrão necessário para deserialização JSON
    public UserDTO() {}

    public UserDTO(String username, String name, Set<String> roles, String email, LocalDateTime registerDate, String password, String photo) {
        this.username = username;
        this.name = name;
        this.roles = roles;
        this.email = email;
        this.registerDate = registerDate;
        this.password = password;
        this.photo = photo;
    }
    public UserDTO(String username, String name, Set<String> roles, String email, LocalDateTime registerDate, String password) {
        this.username = username;
        this.name = name;
        this.roles = roles;
        this.email = email;
        this.registerDate = registerDate;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public LocalDateTime getRegisterDate() {
        return registerDate;
    }

    public void setRegisterDate(LocalDateTime registerDate) {
        this.registerDate = registerDate;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }
}
