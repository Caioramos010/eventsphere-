package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.dto.EventDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.user.User;
import com.eventsphere.mapper.EventMapper;
import com.eventsphere.mapper.ResponseMapper;
import com.eventsphere.service.EventService;
import com.eventsphere.service.ParticipantService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RequestMapping("/api/event")
@RestController
public class EventController {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
    private EventService eventService;
    
    @Autowired
    private ParticipantService participantService;
    
    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    private EventMapper eventMapper;

    @Autowired
    private ResponseMapper responseMapper;
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<?>> getMyEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> events = eventService.getMyActiveEventsWithUserInfo(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Meus eventos carregados com sucesso", events));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<?>> getPublicEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> events = eventService.getPublicEventsWithUserInfo(user.getId(), null, null);
        return ResponseEntity.ok(ApiResponse.success("Eventos públicos carregados com sucesso", events));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> createEvent(@RequestBody EventDTO eventDTO) {
        User user = securityUtils.getAuthenticatedUser();
        eventDTO.setOwnerId(user.getId());
        Event event = eventService.registerEvent(eventDTO);
        EventDTO resultDTO = eventMapper.toDTO(event);
        return ResponseEntity.ok(responseMapper.created(resultDTO));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<?>> getEventDetails(@PathVariable Long eventId) {
        User user = securityUtils.getAuthenticatedUser();
        EventDTO eventDTO = eventService.getEventWithUserInfo(eventId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Detalhes do evento carregados com sucesso", eventDTO));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<ApiResponse<?>> updateEvent(@RequestBody EventDTO eventDTO, @PathVariable Long eventId) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.updateEvent(eventId, eventDTO, user.getId());
        return ResponseEntity.ok(responseMapper.success("Evento editado com sucesso"));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<ApiResponse<?>> deleteEvent(@PathVariable Long eventId) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok(ApiResponse.success("Evento deletado com sucesso", null));
    }

    @GetMapping("/{eventId}/invite")
    public ResponseEntity<ApiResponse<?>> generateInviteLink(@PathVariable Long eventId) {
        User user = securityUtils.getAuthenticatedUser();
        String inviteToken = eventService.generateInviteLink(eventId, user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("inviteToken", inviteToken);
        response.put("inviteUrl", frontendUrl + "/join-event/" + inviteToken);
        
        return ResponseEntity.ok(ApiResponse.success("Link de convite gerado com sucesso", response));
    }

    @GetMapping("/{eventId}/code")
    public ResponseEntity<ApiResponse<?>> generateEventCode(@PathVariable Long eventId) {
        String inviteCode = eventService.ensureEventHasInviteCode(eventId);
        var data = Map.of("eventCode", inviteCode);
        return ResponseEntity.ok(ApiResponse.success("Código do evento gerado com sucesso", data));
    }

    @GetMapping("/invite/{token}")
    public ResponseEntity<ApiResponse<?>> getEventByInviteToken(@PathVariable String token) {
        EventDTO eventDTO = eventService.validateInviteToken(token);
        return ResponseEntity.ok(ApiResponse.success("Evento encontrado", eventDTO));
    }

    @PostMapping("/join/{token}")
    public ResponseEntity<ApiResponse<?>> joinEventByInvite(@PathVariable String token, @RequestBody(required = false) Map<String, String> body) {
        User user = securityUtils.getAuthenticatedUser();
        
        try {
            
            EventDTO eventDTO = eventService.validateInviteToken(token);
            
            
            Event event = participantService.addParticipantByInvite(user.getId(), token, null);
            
            return ResponseEntity.ok(ApiResponse.success("Participação confirmada com sucesso", eventDTO));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/validate-code")
    public ResponseEntity<ApiResponse<?>> validateEventCode(@RequestParam String eventCode) {
        EventDTO eventDTO = eventService.validateEventCodeSimple(eventCode);
        return ResponseEntity.ok(ApiResponse.success("Código válido", eventDTO));
    }

    @GetMapping("/participating")
    public ResponseEntity<ApiResponse<?>> getParticipatingEvents() {
        User user = securityUtils.getAuthenticatedUser();
        List<EventDTO> participatingEvents = eventService.getParticipatingEventsForUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Eventos carregados com sucesso", participatingEvents));
    }

    @GetMapping("/next-events")
    public ResponseEntity<ApiResponse<?>> getNextEvents(
        @RequestParam(defaultValue = "false") boolean onlyPublic,
        @RequestParam(defaultValue = "false") boolean onlyMine) {
        
        User user = securityUtils.getAuthenticatedUser();
        
        if (onlyPublic) {
            List<EventDTO> events = eventService.getNextPublicEventsWithUserInfo(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Próximos eventos públicos carregados com sucesso", events));
        } else if (onlyMine) {
            List<EventDTO> events = eventService.getNextEventsWithUserInfo(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Meus próximos eventos carregados com sucesso", events));
        } else {
            List<EventDTO> myEvents = eventService.getNextEventsWithUserInfo(user.getId());
            List<EventDTO> publicEvents = eventService.getNextPublicEventsWithUserInfo(user.getId());
            
            Set<EventDTO> allEvents = new HashSet<>(myEvents);
            allEvents.addAll(publicEvents);
            
            return ResponseEntity.ok(ApiResponse.success("Próximos eventos carregados com sucesso", new ArrayList<>(allEvents)));
        }
    }

    @PostMapping("/{eventID}/collaborators/{userID}")
    public ResponseEntity<ApiResponse<?>> addCollaborator(@PathVariable Long eventID, @PathVariable Long userID) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.addCollaborator(eventID, userID, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Colaborador adicionado com sucesso", null));
    }

    @PutMapping("/{eventId}/start")
    public ResponseEntity<ApiResponse<?>> startEvent(@PathVariable Long eventId) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.startEvent(eventId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento iniciado com sucesso", null));
    }

    @PutMapping("/{eventId}/finish")
    public ResponseEntity<ApiResponse<?>> finishEvent(@PathVariable Long eventId) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.finishEvent(eventId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento finalizado com sucesso", null));
    }

    @PutMapping("/{eventId}/cancel")
    public ResponseEntity<ApiResponse<?>> cancelEvent(@PathVariable Long eventId) {
        User user = securityUtils.getAuthenticatedUser();
        eventService.cancelEvent(eventId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Evento cancelado com sucesso", null));
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

    @GetMapping("/all-my")
    public ResponseEntity<ApiResponse<?>> getAllMyEvents() {
        User user = securityUtils.getAuthenticatedUser();
        // Chama um método específico que não aplica filtros de estado
        List<EventDTO> events = eventService.getAllMyEventsWithUserInfo(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Todos os meus eventos carregados com sucesso", events));
    }
}
