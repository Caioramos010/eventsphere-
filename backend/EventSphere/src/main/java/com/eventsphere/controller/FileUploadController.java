package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.entity.user.User;
import com.eventsphere.service.EventService;
import com.eventsphere.service.UserService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Autowired
    private EventService eventService;    
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SecurityUtils securityUtils;

    @PostMapping(value = "/event-image")
    public ResponseEntity<ApiResponse<?>> uploadEventImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam("eventID") Long eventId) {
        
        try {
            User user = securityUtils.getAuthenticatedUser();
            Map<String, Object> response = eventService.uploadEventImage(eventId, file, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Imagem do evento carregada com sucesso", response));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error("Acesso negado: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Dados inválidos: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Erro ao processar imagem: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Erro interno do servidor: " + e.getMessage()));
        }
    }   
          
    @PostMapping(value = "/user-photo")
    public ResponseEntity<ApiResponse<?>> uploadUserPhoto(@RequestParam("photo") MultipartFile file) {
        User user = securityUtils.getAuthenticatedUser();
        Map<String, Object> response = userService.uploadUserPhoto(user.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Foto do usuário carregada com sucesso", response));
    }
}
