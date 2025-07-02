package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.UserDTO;
import com.eventsphere.entity.user.User;
import com.eventsphere.exception.AuthenticationException;
import com.eventsphere.mapper.ResponseMapper;
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

    @Autowired
    private ResponseMapper responseMapper;
    @PostMapping("/register/accept")
    public ResponseEntity<ApiResponse<?>> registerControll(@Valid @RequestBody UserDTO userDTO) {
        userService.registerUser(userDTO);
        return ResponseEntity.ok(responseMapper.success("Registro realizado com sucesso"));
    }

    @PostMapping("/login/accept")
    public ResponseEntity<ApiResponse<?>> loginControll(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        Map<String, String> response = userService.login(username, password);
        return ResponseEntity.ok(responseMapper.success(response));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<?>> validateToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        boolean isValid = userService.validateToken(token);
        return ResponseEntity.ok(responseMapper.success(isValid));
    }
}
