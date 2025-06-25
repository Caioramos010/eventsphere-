package com.eventsphere.service;

import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.event.State;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.ParticipantHistoryRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ParticipantService {    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private QrCodeService qrCodeService; // Adicionado QrCodeService

    @Autowired
    private ParticipantHistoryRepository participantHistoryRepository;

    public void updateParticipantStatus(Long eventId, Long userId, ParticipantStatus newStatus) {
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId);
        if (participant == null) {
            throw new IllegalStateException("Participante não encontrado!");
        }
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(participant.getCurrentStatus());
        history.setChangeTimestamp(LocalDateTime.now());
        participant.getParticipantHistory().add(history);

        participant.setCurrentStatus(newStatus);

        participantRepository.save(participant);
    }

    public Event addParticipantByInvite(Long userID, String inviteToken, String inviteCode) {
        if (inviteToken == null || inviteToken.isBlank() || inviteCode == null || inviteCode.isBlank()) {
            throw new IllegalArgumentException("Token e código do convite são obrigatórios");
        }
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));        Optional<Event> event = eventRepository.findByInviteToken(inviteToken);
        if (event.isEmpty() || !event.get().getInviteCode().equals(inviteCode)) {
            throw new IllegalArgumentException("Convite inválido");
        }
        
        // Verificar se o evento aceita novos participantes
        validateEventAcceptsParticipants(event.get());
        if (event.get().getParticipants() == null) {
            event.get().setParticipants(new java.util.ArrayList<>());
        }
        boolean alreadyParticipating = event.get().getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(user.getId()));
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event.orElse(null));
        participant.setUser(user);
        participant.setCurrentStatus(com.eventsphere.entity.event.ParticipantStatus.INVITED);
        event.get().getParticipants().add(participant);
        eventRepository.save(event.get());
        return event.orElse(null);
    }    public Event removeParticipant(Long eventID, Long userID) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));

        // Verificar se o evento permite modificações
        validateEventForModification(event);

        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));

        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().equals(user));

        if (alreadyParticipating) {
            event.getParticipants().removeIf(p -> p.getUser().equals(user));
            return eventRepository.save(event);
        }

        throw new IllegalArgumentException("Usuário não está participando do evento para ser removido.");
    }    public void authorizeRemoveParticipant(Long eventID, Long userID, Long ownerID) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        boolean isOwner = event.getOwner().getId().equals(ownerID);
        boolean isCollaborator = event.getCollaborators() != null && event.getCollaborators().stream().anyMatch(u -> u.getId().equals(ownerID));
        boolean isSelf = user.getId().equals(ownerID);
        if (!(isOwner || isCollaborator || isSelf)) {
            throw new SecurityException("Apenas o dono, colaborador ou o próprio usuário pode remover o participante do evento.");
        }
    }

    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
        public Event joinPublicEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
          if (event.getAcess() != com.eventsphere.entity.event.Acess.PUBLIC) {
            throw new IllegalArgumentException("Este evento não é público e requer convite para participar.");        }
        
        // Verificar se o evento aceita novos participantes
        validateEventAcceptsParticipants(event);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
                
        // Inicializar lista de participantes se necessário
        if (event.getParticipants() == null) {
            event.setParticipants(new java.util.ArrayList<>());
        }
        
        // Verificar se o usuário já é participante
        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));
                
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }
        
        // Criar participante e adicionar ao evento
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(ParticipantStatus.INVITED);
        participant.setIsCollaborator(false);
        
        // Adicionar histórico inicial
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(ParticipantStatus.INVITED);
        history.setChangeTimestamp(LocalDateTime.now());
        
        if (participant.getParticipantHistory() == null) {
            participant.setParticipantHistory(new ArrayList<>());
        }
        participant.getParticipantHistory().add(history);
          event.getParticipants().add(participant);
        return eventRepository.save(event);
    }
    

    public Event joinPublicEventFromRequest(Object eventIdObj, Long userId) {
        if (eventIdObj == null) {
            throw new IllegalArgumentException("ID do evento é obrigatório");
        }
        
        Long eventId;
        try {
            if (eventIdObj instanceof Number) {
                eventId = ((Number) eventIdObj).longValue();
            } else {
                eventId = Long.parseLong(eventIdObj.toString());
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ID do evento inválido");
        }
        
        return joinPublicEvent(eventId, userId);
    }

    /**
     * Confirma a participação de um participante
     */    public void confirmParticipant(Long eventId, Long userId, Long authUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
        
        // Verificar se o evento permite modificações
        validateEventForModification(event);
        
        // Verificar se o usuário autenticado tem permissão (owner ou colaborador)
        authorizeEventManagement(event, authUserId);
        
        EventParticipant participant = event.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado no evento"));
        
        // Atualizar status para confirmado
        participant.setCurrentStatus(ParticipantStatus.CONFIRMED);
        participantRepository.save(participant);
    }

    /**
     * Promove um participante a colaborador
     */    public void promoteToCollaborator(Long eventId, Long userId, Long authUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
        
        // Verificar se o evento permite modificações
        validateEventForModification(event);
        
        // Verificar se o usuário autenticado é o owner do evento
        if (!event.getOwner().getId().equals(authUserId)) {
            throw new SecurityException("Apenas o organizador pode promover colaboradores");
        }
        
        EventParticipant participant = event.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado no evento"));
        
        participant.setIsCollaborator(true);
        participantRepository.save(participant);
    }

    /**
     * Remove colaborador (rebaixa para participante comum)
     */    public void demoteCollaborator(Long eventId, Long userId, Long authUserId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
        
        // Verificar se o evento permite modificações
        validateEventForModification(event);
        
        // Verificar se o usuário autenticado é o owner do evento
        if (!event.getOwner().getId().equals(authUserId)) {
            throw new SecurityException("Apenas o organizador pode remover colaboradores");
        }
        
        EventParticipant participant = event.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado no evento"));
        
        participant.setIsCollaborator(false);
        participantRepository.save(participant);
    }    /**
     * Verifica se o usuário tem permissão para gerenciar o evento
     */
    private void authorizeEventManagement(Event event, Long authUserId) {
        boolean isOwner = event.getOwner().getId().equals(authUserId);
        boolean isCollaborator = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(authUserId) && p.isCollaborator());
        
        if (!isOwner && !isCollaborator) {
            throw new SecurityException("Usuário não tem permissão para gerenciar este evento");
        }
    }

    // Método para participar de evento via convite
    public void joinEventWithInvite(Object eventIdObj, String inviteToken, Long userId) {
        // Validar o token de convite primeiro
        Event event = eventService.validateInviteTokenAndGetEvent(inviteToken);
        
        if (event == null) {
            throw new IllegalArgumentException("Token de convite inválido ou expirado");
        }
        
        // Converter o eventId para Long
        Long eventId;
        if (eventIdObj instanceof Integer) {
            eventId = ((Integer) eventIdObj).longValue();
        } else if (eventIdObj instanceof Long) {
            eventId = (Long) eventIdObj;
        } else if (eventIdObj instanceof String) {
            try {
                eventId = Long.parseLong((String) eventIdObj);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("ID do evento deve ser um número válido");
            }
        } else {
            throw new IllegalArgumentException("ID do evento deve ser um número válido");
        }        // Verificar se o eventId bate com o evento do token
        if (!event.getId().equals(eventId)) {
            throw new IllegalArgumentException("Token de convite não corresponde ao evento");
        }
        
        // Verificar se o evento aceita novos participantes
        validateEventAcceptsParticipants(event);
          // Verificar se o usuário já é participante
        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));
                
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Você já é um participante deste evento");
        }
        
        // Buscar o usuário
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        
        // Criar participação (mesmo para eventos privados, pois há convite válido)
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(ParticipantStatus.INVITED);
        participant.setIsCollaborator(false);
        
        // Inicializar lista de participantes se necessário
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        
        event.getParticipants().add(participant);
        participantRepository.save(participant);
    }
    
    // Método para participar de evento via código
    public void joinEventWithCode(String eventCode, Long userId) {
        // Validar o código do evento primeiro
        Event event = eventService.validateEventCodeAndGetEvent(eventCode);
        
        if (event == null) {
            throw new IllegalArgumentException("Código de evento inválido");
        }
        
        // Verificar se o evento aceita novos participantes
        validateEventAcceptsParticipants(event);
          
        // Verificar se o usuário já é participante
        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));
                
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Você já é um participante deste evento");
        }
        
        // Buscar o usuário
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        
        // Criar participação
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(ParticipantStatus.INVITED);
        participant.setIsCollaborator(false);
        
        // Inicializar lista de participantes se necessário
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        
        event.getParticipants().add(participant);
        participantRepository.save(participant);
    }

    // Método auxiliar para verificar se o evento aceita novos participantes
    private void validateEventAcceptsParticipants(Event event) {
        // Verificar se o evento está ativo (se estiver ativo, não permite mais participações)
        if (event.getState() == com.eventsphere.entity.event.State.ACTIVE) {
            throw new IllegalArgumentException("Este evento já foi iniciado e não aceita mais participantes.");
        }
        
        // Verificar se o evento foi encerrado (se estiver encerrado, não permite mais participações)
        if (event.getState() == com.eventsphere.entity.event.State.FINISHED) {
            throw new IllegalArgumentException("Este evento já foi encerrado e não aceita mais participantes.");
        }
        
        // Verificar se o evento foi cancelado (se estiver cancelado, não permite mais participações)
        if (event.getState() == com.eventsphere.entity.event.State.CANCELED) {
            throw new IllegalArgumentException("Este evento foi cancelado e não aceita mais participantes.");
        }
    }
    
    /**
     * Valida se o evento permite modificações baseado no seu estado
     */
    private void validateEventForModification(Event event) {
        com.eventsphere.entity.event.State state = event.getState();
        
        if (state == com.eventsphere.entity.event.State.CANCELED) {
            throw new IllegalStateException("Não é possível realizar operações em eventos cancelados.");
        }
        
        if (state == com.eventsphere.entity.event.State.ACTIVE) {
            throw new IllegalStateException("Não é possível modificar participantes após o evento ser iniciado.");
        }
        
        if (state == com.eventsphere.entity.event.State.FINISHED) {
            throw new IllegalStateException("Não é possível modificar participantes após o evento ser encerrado.");
        }
    }    /**
     * Gera QR Code para um participante
     */
    public Map<String, Object> generateQrCodeForParticipant(Long eventId, Long userId) {
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId);
        
        if (participant == null) {
            throw new IllegalArgumentException("Você não é participante deste evento");
        }
        
        if (participant.getEvent().getState() != com.eventsphere.entity.event.State.ACTIVE) {
            throw new IllegalArgumentException("QR Code só está disponível durante eventos ativos");
        }
        
        Map<String, String> qrCodeData = qrCodeService.createQrCodeComplete(participant.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("qrCode", qrCodeData.get("qrCodeImage")); // Imagem Base64
        response.put("qrCodeText", qrCodeData.get("qrCodeText")); // Texto do QR Code
        response.put("participantId", participant.getId());
        response.put("eventName", participant.getEvent().getName());
        
        return response;
    }

    /**
     * Gera relatório de presença para um evento
     */
    public Map<String, Object> generateAttendanceReport(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));
        
        // Verificar se o usuário tem permissão (owner ou colaborador)
        boolean isOwner = event.getOwner().getId().equals(userId);
        boolean isCollaborator = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId) && p.isCollaborator());
        
        if (!isOwner && !isCollaborator) {
            throw new IllegalArgumentException("Apenas organizadores podem ver o relatório de presença");
        }
        
        // Separar participantes por presença
        List<EventParticipant> allParticipants = event.getParticipants();
        
        List<Map<String, Object>> presentParticipants = new ArrayList<>();
        List<Map<String, Object>> absentParticipants = new ArrayList<>();
        
        for (EventParticipant participant : allParticipants) {
            Map<String, Object> participantData = new HashMap<>();
            participantData.put("id", participant.getId());
            participantData.put("userId", participant.getUser().getId());
            participantData.put("userName", participant.getUser().getName());
            participantData.put("userEmail", participant.getUser().getEmail());
            participantData.put("userPhoto", participant.getUser().getPhoto());
            participantData.put("isCollaborator", participant.isCollaborator());
            participantData.put("currentStatus", participant.getCurrentStatus().toString());
            
            // Verificar se está presente baseado no status
            if (participant.getCurrentStatus() == ParticipantStatus.PRESENT) {
                presentParticipants.add(participantData);
            } else {
                absentParticipants.add(participantData);
            }
        }
        
        Map<String, Object> report = new HashMap<>();
        report.put("eventName", event.getName());
        report.put("eventState", event.getState().toString());
        report.put("totalParticipants", allParticipants.size());
        report.put("presentCount", presentParticipants.size());
        report.put("absentCount", absentParticipants.size());
        report.put("presentParticipants", presentParticipants);
        report.put("absentParticipants", absentParticipants);
        
        return report;
    }

    /**
     * Remove um participante com verificação de autorização
     * 
     * @param eventID ID do evento
     * @param userID ID do usuário a ser removido
     * @param authUserID ID do usuário que está fazendo a remoção
     */
    public void removeParticipantWithAuth(Long eventID, Long userID, Long authUserID) {
        authorizeRemoveParticipant(eventID, userID, authUserID);
        removeParticipant(eventID, userID);
    }
    
    /**
     * Marca presença de um participante
     * 
     * @param participantId ID do participante
     * @param eventIdObj ID do evento
     * @param authUserId ID do usuário autenticado
     * @return Dados do participante
     */
    public Object markPresence(Long participantId, Object eventIdObj, Long authUserId) {
        // Converter eventId para Long
        Long eventId;
        if (eventIdObj instanceof String) {
            try {
                eventId = Long.parseLong((String) eventIdObj);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("ID do evento inválido");
            }
        } else if (eventIdObj instanceof Number) {
            eventId = ((Number) eventIdObj).longValue();
        } else {
            throw new IllegalArgumentException("Tipo de ID do evento inválido");
        }

        // Verificar se o evento existe
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));        // Verificar se o usuário tem permissão (deve ser organizador ou colaborador)
        EventParticipant authParticipant = participantRepository.findByEventIdAndUserId(eventId, authUserId);
        if (authParticipant == null || (!authParticipant.isCollaborator() && !event.getOwner().getId().equals(authUserId))) {
            throw new SecurityException("Você não tem permissão para marcar presença neste evento");
        }

        // Verificar se o participante existe
        EventParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado"));

        // Verificar se o participante pertence ao evento
        if (!participant.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Participante não pertence a este evento");
        }        // Verificar se o evento já começou
        if (event.getState() != State.ACTIVE) {
            throw new IllegalArgumentException("Só é possível marcar presença em eventos ativos");
        }

        // Marcar presença
        if (participant.getCurrentStatus() != ParticipantStatus.PRESENT) {
            updateParticipantStatus(eventId, participant.getUser().getId(), ParticipantStatus.PRESENT);
        }

        // Retornar dados do participante
        Map<String, Object> participantData = new HashMap<>();
        participantData.put("id", participant.getId());
        participantData.put("userId", participant.getUser().getId());
        participantData.put("status", participant.getCurrentStatus().toString());
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("name", participant.getUser().getName());
        userData.put("email", participant.getUser().getEmail());
        participantData.put("user", userData);
        
        return participantData;
    }
    
    public List<Object> getPresentParticipants(Long eventId, Long authUserId) {
        // Verificar se o evento existe
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado"));        // Verificar se o usuário tem permissão (deve ser organizador ou colaborador)
        EventParticipant authParticipant = participantRepository.findByEventIdAndUserId(eventId, authUserId);
        if (authParticipant == null || (!authParticipant.isCollaborator() && !event.getOwner().getId().equals(authUserId))) {
            throw new SecurityException("Você não tem permissão para ver a lista de presença");
        }        // Buscar participantes presentes
        List<EventParticipant> presentParticipants = participantRepository.findByEventIdAndCurrentStatus(eventId, ParticipantStatus.PRESENT);
        
        List<Object> result = new ArrayList<>();
        for (EventParticipant participant : presentParticipants) {
            Map<String, Object> participantData = new HashMap<>();
            participantData.put("id", participant.getId());
            participantData.put("userId", participant.getUser().getId());
            participantData.put("name", participant.getUser().getName());
            participantData.put("status", participant.getCurrentStatus().toString());
            String scannedAt = "Agora";
            if (!participant.getParticipantHistory().isEmpty()) {
                for (ParticipantHistory history : participant.getParticipantHistory()) {
                    if (history.getStatus() == ParticipantStatus.PRESENT) {
                        scannedAt = history.getChangeTimestamp().toLocalTime().toString();
                        break;
                    }
                }
            }
            participantData.put("scannedAt", scannedAt);
            result.add(participantData);
        }
        
        return result;
    }

    // ...existing code...
}