package com.eventsphere.service;

import com.eventsphere.dto.UserDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ParticipantService {

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QrCodeService qrCodeService; // Adicionado QrCodeService

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
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        Event event = eventRepository.findByInviteToken(inviteToken);
        if (event == null || !event.getInviteCode().equals(inviteCode)) {
            throw new IllegalArgumentException("Convite inválido");
        }
        if (event.getParticipants() == null) {
            event.setParticipants(new java.util.ArrayList<>());
        }
        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(user.getId()));
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(com.eventsphere.entity.event.ParticipantStatus.INVITED);
        event.getParticipants().add(participant);
        eventRepository.save(event);
        return event;
    }
    public Event removeParticipant(Long eventID, Long userID) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));

        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));

        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().equals(user));

        if (alreadyParticipating) {
            event.getParticipants().removeIf(p -> p.getUser().equals(user));
            return eventRepository.save(event);
        }

        throw new IllegalArgumentException("Usuário não está participando do evento para ser removido.");
    }

    public void authorizeRemoveParticipant(Long eventID, Long userID, Long ownerID) {
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

    public User getAuthenticatedUser(String username) {
        return userRepository.findByUsername(username);
    }


    private UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return new UserDTO(user.getUsername(), user.getName(), user.getRoles(), user.getEmail(), user.getRegisterDate(), null, user.getPhoto());
    }
}