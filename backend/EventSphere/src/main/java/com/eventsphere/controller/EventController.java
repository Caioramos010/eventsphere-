package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.EventDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.user.User;
import com.eventsphere.mapper.EventMapper;
import com.eventsphere.mapper.ResponseMapper;
import com.eventsphere.service.EventService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("/api/event")
@RestController
public class EventController {

    @Autowired
    private EventService eventService;
    
    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private EventMapper eventMapper;

    @Autowired
    private ResponseMapper responseMapper;
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> registerEvent(@RequestBody EventDTO eventDTO) {
        User user = securityUtils.getAuthenticatedUser();
        eventDTO.setOwnerId(user.getId());
        Event event = eventService.registerEvent(eventDTO);
        EventDTO resultDTO = eventMapper.toDTO(event);
        return ResponseEntity.ok(responseMapper.created(resultDTO));
    }

    @PutMapping("/edit")
    public ResponseEntity<ApiResponse<?>> editEvent(@RequestBody EventDTO eventDTO, @RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.updateEvent(eventID, eventDTO, user.getId());
        return ResponseEntity.ok(responseMapper.success("Evento editado com sucesso"));
    }    

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<?>> getEventControll(@RequestParam Long eventID){
        User user = securityUtils.getAuthenticatedUser();
        EventDTO eventDTO = eventService.getEventWithUserInfo(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success(eventDTO));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<?>> deleteEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.authorizeEditEvent(eventID, user.getId());
        eventService.deleteEvent(eventID);
        return ResponseEntity.ok(ApiResponse.success("Evento deletado com sucesso", null));
    }

    @PutMapping("/start")
    public ResponseEntity<ApiResponse<?>> startEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.startEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento iniciado com sucesso", null));
    }

    @PutMapping("/finish")
    public ResponseEntity<ApiResponse<?>> finishEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.finishEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento finalizado com sucesso", null));
    }

    @PutMapping("/cancel")
    public ResponseEntity<ApiResponse<?>> cancelEventControll(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.cancelEvent(eventID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento cancelado com sucesso", null));
    }   

    @GetMapping("/get-myevents")
    public ResponseEntity<ApiResponse<?>> getMyEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> events = eventService.getMyEventsWithUserInfo(user.getId());
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/get-public")
    public ResponseEntity<ApiResponse<?>> getPublicEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> events = eventService.getPublicEventsWithUserInfo(user.getId());
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @PostMapping("/add-collaborator")
    public ResponseEntity<ApiResponse<?>> addCollaborator(@RequestParam Long eventID, @RequestParam Long userID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.addCollaborator(eventID, userID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Colaborador adicionado com sucesso", null));
    }

    @PostMapping("/create-with-invite")
    public ResponseEntity<ApiResponse<?>> createEventWithInvite(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        String inviteToken = eventService.generateInviteLink(eventID, user.getId());
        Event event = eventService.getEvent(eventID);
        
        var data = Map.of(
            "inviteToken", inviteToken,
            "inviteCode", event.getInviteCode()
        );
        return ResponseEntity.ok(ApiResponse.success("Convite criado com sucesso", data));
    }

    @GetMapping("/invite/generate")
    public ResponseEntity<ApiResponse<?>> generateInviteLink(@RequestParam Long eventID) {
        User user = securityUtils.getAuthenticatedUser();
        String inviteToken = eventService.generateInviteLink(eventID, user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("inviteToken", inviteToken);
        response.put("inviteUrl", "http://localhost:3000/invite/" + inviteToken);
        
        return ResponseEntity.ok(ApiResponse.success("Link de convite gerado com sucesso", response));
    }
    
    @GetMapping("/invite/validate")
    public ResponseEntity<ApiResponse<?>> validateInviteToken(@RequestParam String token) {
        EventDTO eventDTO = eventService.validateInviteToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token válido", eventDTO));
    }

    @GetMapping("/validate-code")
    public ResponseEntity<ApiResponse<?>> validateEventCode(@RequestParam String eventCode) {
        try {
            EventDTO eventDTO = eventService.validateEventCodeSimple(eventCode);
            return ResponseEntity.ok(ApiResponse.success("Código válido", eventDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @GetMapping("/participating")
    public ResponseEntity<ApiResponse<?>> getParticipatingEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> participatingEvents = eventService.getParticipatingEventsForUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Eventos carregados com sucesso", participatingEvents));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<?>> getEventById(@PathVariable Long eventId) {
        try {
            User user = securityUtils.getAuthenticatedUser();
            EventDTO eventDTO = eventService.getEventWithUserInfo(eventId, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Evento encontrado", eventDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @GetMapping("/next-events")
    public ResponseEntity<ApiResponse<?>> getNextEvents() {
        User user = securityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(eventService.getNextEventsWithUserInfo(user.getId())));
    }

    @GetMapping("/next-public-events")
    public ResponseEntity<ApiResponse<?>> getNextPublicEvents() {
        User user = securityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(eventService.getNextPublicEventsWithUserInfo(user.getId())));
    }

    @PostMapping("/{eventId}/ensure-code")
    public ResponseEntity<ApiResponse<?>> ensureEventCode(@PathVariable Long eventId) {
        try {
            String inviteCode = eventService.ensureEventHasInviteCode(eventId);
            var data = Map.of("inviteCode", inviteCode);
            return ResponseEntity.ok(ApiResponse.success("Código de convite disponível", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Erro interno do servidor"));
        }
    }

    @GetMapping("/debug-date")
    public ResponseEntity<ApiResponse<?>> debugDate() {
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("systemTimezone", java.util.TimeZone.getDefault().getID());
        debugInfo.put("systemDateTime", java.time.LocalDateTime.now());
        debugInfo.put("saoPauloDateTime", java.time.LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo")));
        debugInfo.put("utcDateTime", java.time.LocalDateTime.now(java.time.ZoneId.of("UTC")));
        
        return ResponseEntity.ok(ApiResponse.success("Debug de data/hora", debugInfo));
    }
}
