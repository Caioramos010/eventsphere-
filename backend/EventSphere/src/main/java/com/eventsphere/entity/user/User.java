package com.eventsphere.entity.user;

import jakarta.persistence.*;
import java.util.Set;

import java.time.LocalDateTime;
import java.util.HashSet;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = false)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", unique = false)
    private Set<String> roles = new HashSet<>();

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime registerDate;

    @Column(nullable = false, unique = false)
    private String password;

    private String photo;

    public User(String username, String name, Set<String> roles, String email, LocalDateTime registerDate, String photo) {
        this.username = username;
        this.name = name;
        this.roles = roles;
        this.email = email;
        this.registerDate = registerDate;
        this.photo = photo;
    }
    public User(String username, String name, Set<String> roles, String email, LocalDateTime registerDate) {
        this.username = username;
        this.name = name;
        this.roles = roles;
        this.email = email;
        this.registerDate = registerDate;
    }

    public User() {

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
