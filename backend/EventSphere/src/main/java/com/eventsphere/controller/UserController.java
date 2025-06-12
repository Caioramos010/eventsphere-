package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            username = userDetails.getUsername();
        } else {
            username = authentication.getName();
        }
        return userRepository.findByUsername(username);
    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<?>> getUser() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(userService.getUserDisplay(user.getId())));
    }

    @PutMapping("/update-name")
    public ResponseEntity<ApiResponse<?>> updateUserName(@RequestParam String newName) {
        User user = getAuthenticatedUser();
        userService.validateNewName(user.getId(), newName);
        userService.updateName(user.getId(), newName);
        return ResponseEntity.ok(ApiResponse.success("Nome atualizado com sucesso", null));
    }

    @PutMapping("/update-email")
    public ResponseEntity<ApiResponse<?>> updateUserEmail(@RequestParam String newEmail){
        User user = getAuthenticatedUser();
        userService.updateEmail(user.getId(), newEmail);
        return ResponseEntity.ok(ApiResponse.success("Email atualizado com sucesso", null));
    }

    @PutMapping("/update-username")
    public ResponseEntity<ApiResponse<?>> updateUserUsername(@RequestParam String newUsername){
        User user = getAuthenticatedUser();
        userService.updateUsername(user.getId(), newUsername);
        return ResponseEntity.ok(ApiResponse.success("Login atualizado com sucesso", null));
    }

    @PutMapping("/update-passowrd")
    public ResponseEntity<ApiResponse<?>> updateUserPassword(@RequestParam String currentPassword, @RequestParam String newPassword){
        User user = getAuthenticatedUser();
        userService.updatePassword(user.getId(), currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Senha atualizada com sucesso", null));
    }

    @PutMapping("/update-photo")
    public ResponseEntity<ApiResponse<?>> updateUserPhoto(@RequestParam String newPhoto ){
        User user = getAuthenticatedUser();
        userService.updatePhoto(user.getId(), newPhoto);
        return ResponseEntity.ok(ApiResponse.success("Foto atualizada com sucesso", null));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<?>> deleteUser(@RequestParam String password ){
        User user = getAuthenticatedUser();
        if (user == null || !userService.validatePassword(password, user.getPassword())){
            return ResponseEntity.badRequest().body(ApiResponse.error("Senha inválida"));
        }
        userService.deleteUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Usuário deletado com sucesso", null));
    }
}
