package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.UserDTO;
import com.eventsphere.entity.user.User;
import com.eventsphere.service.UserService;
import com.eventsphere.utils.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @PostMapping("/register/accept")
    public ResponseEntity<ApiResponse<?>> registerControll(@Valid @RequestBody UserDTO userDTO) {
        try {
            userService.registerUser(userDTO);
            return ResponseEntity.ok(ApiResponse.success("Registro realizado com sucesso", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Erro interno do servidor. Tente novamente."));
        }
    }

    @PostMapping("/login/accept")
    public ResponseEntity<ApiResponse<?>> loginControll(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");
            Map<String, String> response = userService.login(username, password);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Erro interno do servidor. Tente novamente."));
        }
    }
}
