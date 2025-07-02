package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.entity.user.User;
import com.eventsphere.mapper.ResponseMapper;
import com.eventsphere.service.UserService;
import com.eventsphere.utils.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private ResponseMapper responseMapper;    @GetMapping("/get")
    public ResponseEntity<ApiResponse<?>> getUser() {
        User user = securityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(responseMapper.success(userService.getUserProfile(user.getId())));
    }

    @PutMapping("/update-name")
    public ResponseEntity<ApiResponse<?>> updateUserName(@RequestParam String newName) {
        User user = securityUtils.getAuthenticatedUser();
        userService.updateName(user.getId(), newName);
        return ResponseEntity.ok(responseMapper.success("Nome atualizado com sucesso"));
    }

    @PutMapping("/update-email")
    public ResponseEntity<ApiResponse<?>> updateUserEmail(@RequestParam String newEmail){
        User user = securityUtils.getAuthenticatedUser();
        userService.updateEmail(user.getId(), newEmail);
        return ResponseEntity.ok(responseMapper.success("Email atualizado com sucesso"));
    }

    @PutMapping("/update-username")
    public ResponseEntity<ApiResponse<?>> updateUserUsername(@RequestParam String newUsername){
        User user = securityUtils.getAuthenticatedUser();
        userService.updateUsername(user.getId(), newUsername);
        return ResponseEntity.ok(responseMapper.success("Login atualizado com sucesso"));
    }

    @PutMapping("/update-passowrd")
    public ResponseEntity<ApiResponse<?>> updateUserPassword(@RequestParam String currentPassword, @RequestParam String newPassword){
        User user = securityUtils.getAuthenticatedUser();
        userService.updatePassword(user.getId(), currentPassword, newPassword);
        return ResponseEntity.ok(responseMapper.success("Senha atualizada com sucesso"));
    }

    @PutMapping("/update-photo")
    public ResponseEntity<ApiResponse<?>> updateUserPhoto(@RequestParam String newPhoto ){
        User user = securityUtils.getAuthenticatedUser();
        userService.updatePhoto(user.getId(), newPhoto);
        return ResponseEntity.ok(ApiResponse.success("Foto atualizada com sucesso", null));
    }    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<?>> deleteUser(@RequestParam String password) {
        User user = securityUtils.getAuthenticatedUser();
        userService.deleteUserWithPasswordCheck(user.getId(), password);
        return ResponseEntity.ok(ApiResponse.success("Conta bloqueada com sucesso. Todas as participações foram removidas.", null));
    }
}
