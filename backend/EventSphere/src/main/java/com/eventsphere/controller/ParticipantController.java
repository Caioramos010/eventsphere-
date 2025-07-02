package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.entity.user.User;
import com.eventsphere.service.ParticipantService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired
    private ParticipantService participantService;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private com.eventsphere.service.QrCodeService qrCodeService;

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<?>> removeParticipant(@RequestParam Long eventID, @RequestParam Long userID) {
        User authUser = securityUtils.getAuthenticatedUser();
        participantService.removeParticipantWithAuth(eventID, userID, authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Participante removido com sucesso", null));
    }

    @DeleteMapping("/{eventId}/users/{userId}")
    public ResponseEntity<ApiResponse<?>> removeParticipantByPath(@PathVariable Long eventId, @PathVariable Long userId) {
        User authUser = securityUtils.getAuthenticatedUser();
        participantService.removeParticipantWithAuth(eventId, userId, authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Participante removido com sucesso", null));
    }

    @PostMapping("/join-event")
    public ResponseEntity<ApiResponse<?>> joinPublicEvent(@RequestBody Map<String, Object> request) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            Object eventIdObj = request.get("eventId");
            
            participantService.joinPublicEventFromRequest(eventIdObj, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Você agora é um participante deste evento", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @PostMapping("/join-with-invite")
    public ResponseEntity<ApiResponse<?>> joinEventWithInvite(@RequestBody Map<String, Object> request) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            Object eventIdObj = request.get("eventId");
            String inviteToken = (String) request.get("inviteToken");
            
            participantService.joinEventWithInvite(eventIdObj, inviteToken, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Você agora é um participante deste evento via convite", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @PutMapping("/confirm/{eventID}/{userID}")
    public ResponseEntity<ApiResponse<?>> confirmParticipant(@PathVariable Long eventID, @PathVariable Long userID) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            participantService.confirmParticipant(eventID, userID, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Participação confirmada com sucesso", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @PutMapping("/promote/{eventID}/{userID}")
    public ResponseEntity<ApiResponse<?>> promoteToCollaborator(@PathVariable Long eventID, @PathVariable Long userID) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            participantService.promoteToCollaborator(eventID, userID, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Participante promovido a colaborador", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @PutMapping("/demote/{eventID}/{userID}")
    public ResponseEntity<ApiResponse<?>> demoteCollaborator(@PathVariable Long eventID, @PathVariable Long userID) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            participantService.demoteCollaborator(eventID, userID, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Colaborador removido com sucesso", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @PostMapping("/generate-qr-code/{eventId}")
    public ResponseEntity<ApiResponse<?>> generateQrCode(@PathVariable Long eventId) {
        User authUser = securityUtils.getAuthenticatedUser();
        Map<String, Object> response = participantService.generateQrCodeForParticipant(eventId, authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("QR Code gerado com sucesso", response));
    }

    @GetMapping("/attendance-report/{eventId}")
    public ResponseEntity<ApiResponse<?>> getAttendanceReport(@PathVariable Long eventId) {
        User authUser = securityUtils.getAuthenticatedUser();
        Map<String, Object> report = participantService.generateAttendanceReport(eventId, authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Relatório de presença gerado", report));
    }

    @PostMapping("/join-with-code")
    public ResponseEntity<ApiResponse<?>> joinEventWithCode(@RequestBody Map<String, String> request) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            String eventCode = request.get("eventCode");
            
            if (eventCode == null || eventCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Código do evento é obrigatório"));
            }
            
            participantService.joinEventWithCode(eventCode, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Você agora é um participante deste evento", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }
    
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<?>> confirmOwnAttendance(@RequestBody Map<String, Object> request) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            Long eventId = Long.valueOf(request.get("eventId").toString());
            
            participantService.confirmParticipant(eventId, authUser.getId(), authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Presença confirmada com sucesso", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }
    
    @PostMapping("/leave-event")
    public ResponseEntity<ApiResponse<?>> leaveEvent(@RequestBody Map<String, Object> request) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            Long eventId = Long.valueOf(request.get("eventId").toString());
            
            
            participantService.removeParticipantWithAuth(eventId, authUser.getId(), authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Você saiu do evento com sucesso", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @GetMapping("/qr-code/{eventId}")
    public ResponseEntity<ApiResponse<?>> getQrCode(@PathVariable Long eventId) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            Map<String, Object> qrData = participantService.generateQrCodeForParticipant(eventId, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("QR Code gerado com sucesso", qrData));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro ao gerar QR Code: " + e.getMessage()));
        }
    }

    @PostMapping("/presence/{token}")
    public ResponseEntity<ApiResponse<?>> markPresence(@PathVariable String token) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            Object result = participantService.markPresenceByToken(token, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Presença marcada com sucesso", result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro ao marcar presença: " + e.getMessage()));
        }
    }
    
    @GetMapping("/present/{eventId}")
    public ResponseEntity<ApiResponse<?>> getPresentParticipants(@PathVariable Long eventId) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            List<Object> presentParticipants = participantService.getPresentParticipants(eventId, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Lista de participantes presentes", presentParticipants));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro ao buscar participantes presentes: " + e.getMessage()));
        }
    }
}
