package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.service.EventService;
import com.eventsphere.service.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired
    private ParticipantService participantService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventService eventService;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<?>> removeParticipant(@RequestParam Long eventID, @RequestParam Long userID) {
        User authUser = getAuthenticatedUser();
        participantService.authorizeRemoveParticipant(eventID, userID, authUser.getId());
        participantService.removeParticipant(eventID, userID);
        return ResponseEntity.ok(ApiResponse.success("Participante removido com sucesso", null));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<?>> addParticipantByInvite(@RequestBody Map<String, String> request) {
        User authUser = getAuthenticatedUser();
        String inviteToken = request.get("inviteToken");
        String inviteCode = request.get("inviteCode");
        participantService.addParticipantByInvite(authUser.getId(), inviteToken, inviteCode);
        return ResponseEntity.ok(ApiResponse.success("Participante adicionado ao evento com sucesso", null));
    }
}
