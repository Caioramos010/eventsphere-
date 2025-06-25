package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.entity.user.User;
import com.eventsphere.service.ParticipantService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controlador para gerenciamento de participantes em eventos
 */
@RestController
@RequestMapping("/api/participant")
public class ParticipantController {

    @Autowired
    private ParticipantService participantService;

    @Autowired
    private SecurityUtils securityUtils;/**
     * Remove um participante de um evento
     *
     * @param eventID ID do evento
     * @param userID ID do usuário a ser removido
     * @return Resposta de sucesso
     */
    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<?>> removeParticipant(@RequestParam Long eventID, @RequestParam Long userID) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            participantService.removeParticipantWithAuth(eventID, userID, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Participante removido com sucesso", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }    /**
     * Remove um participante de um evento (nova versão com path variables)
     *
     * @param eventID ID do evento
     * @param userID ID do usuário a ser removido
     * @return Resposta de sucesso
     */
    @DeleteMapping("/remove/{eventID}/{userID}")
    public ResponseEntity<ApiResponse<?>> removeParticipantByPath(@PathVariable Long eventID, @PathVariable Long userID) {
        try {
            User authUser = securityUtils.getAuthenticatedUser();
            participantService.removeParticipantWithAuth(eventID, userID, authUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Participante removido com sucesso", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }    /**
     * Permite que um usuário participe diretamente de um evento público
     *
     * @param request Mapa contendo o ID do evento
     * @return Resposta de sucesso
     */
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
    }    /**
     * Permite que um usuário participe de um evento via convite
     *
     * @param request Dados da requisição contendo eventId e inviteToken
     * @return Resposta de sucesso
     */    @PostMapping("/join-with-invite")
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
    }/**
     * Confirma a participação de um participante
     *
     * @param eventID ID do evento
     * @param userID ID do usuário
     * @return Resposta de sucesso
     */
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
    }    /**
     * Promove um participante a colaborador
     *
     * @param eventID ID do evento
     * @param userID ID do usuário
     * @return Resposta de sucesso
     */
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
    }    /**
     * Remove colaborador (rebaixa para participante comum)
     *
     * @param eventID ID do evento
     * @param userID ID do usuário
     * @return Resposta de sucesso
     */
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
    @GetMapping("/qr-code/{eventId}")
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
    /**
     * Permite que um usuário participe de um evento usando código de convite
     *
     * @param request Dados da requisição contendo eventCode
     * @return Resposta de sucesso
     */
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
}
