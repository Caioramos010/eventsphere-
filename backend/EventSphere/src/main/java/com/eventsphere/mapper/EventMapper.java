package com.eventsphere.mapper;

import com.eventsphere.dto.EventDTO;
import com.eventsphere.dto.ParticipantDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.user.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EventMapper {

    private ParticipantDTO participantToDTO(EventParticipant participant) {
        if (participant == null) {
            return null;
        }

        ParticipantDTO dto = new ParticipantDTO();
        dto.setId(participant.getId());
        dto.setUserId(participant.getUser().getId());
        dto.setUserName(participant.getUser().getName());
        dto.setUserUsername(participant.getUser().getUsername());
        dto.setUserEmail(participant.getUser().getEmail());
        dto.setUserPhoto(participant.getUser().getPhoto());
        dto.setCollaborator(participant.isCollaborator());
        dto.setStatus(participant.getCurrentStatus().name());
        dto.setConfirmed(participant.getCurrentStatus().name().equals("CONFIRMED"));

        return dto;
    }

    public EventDTO toDTO(Event event) {
        if (event == null) {
            return null;
        }

        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDateFixedStart(event.getDateFixedStart());
        dto.setDateStart(event.getDateStart());
        dto.setDateFixedEnd(event.getDateFixedEnd());
        dto.setDateEnd(event.getDateEnd());
        dto.setTimeFixedStart(event.getTimeFixedStart());
        dto.setTimeStart(event.getTimeStart());
        dto.setTimeFixedEnd(event.getTimeFixedEnd());
        dto.setTimeEnd(event.getTimeEnd());
        dto.setLocalization(event.getLocalization());
        dto.setDescription(event.getDescription());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setClassification(event.getClassification());
        dto.setAcess(event.getAcess());
        dto.setPhoto(event.getPhoto());
        dto.setState(event.getState());
        dto.setOwnerId(event.getOwner() != null ? event.getOwner().getId() : null);
        dto.setInviteToken(event.getInviteToken());
        dto.setInviteCode(event.getInviteCode());


        if (event.getCollaborators() != null) {
            dto.setCollaboratorIds(event.getCollaborators().stream()
                    .map(User::getId)
                    .collect(Collectors.toList()));
        }


        if (event.getParticipants() != null) {
            dto.setParticipantIds(event.getParticipants().stream()
                    .map(participant -> participant.getUser().getId())
                    .collect(Collectors.toList()));
            
            dto.setParticipants(event.getParticipants().stream()
                    .map(this::participantToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Event toEntity(EventDTO dto) {
        if (dto == null) {
            return null;
        }

        Event event = new Event();
        event.setId(dto.getId());
        event.setName(dto.getName());
        event.setDateFixedStart(dto.getDateFixedStart());
        event.setDateStart(dto.getDateStart());
        event.setDateFixedEnd(dto.getDateFixedEnd());
        event.setDateEnd(dto.getDateEnd());
        event.setTimeFixedStart(dto.getTimeFixedStart());
        event.setTimeStart(dto.getTimeStart());
        event.setTimeFixedEnd(dto.getTimeFixedEnd());
        event.setTimeEnd(dto.getTimeEnd());
        event.setLocalization(dto.getLocalization());
        event.setDescription(dto.getDescription());
        event.setMaxParticipants(dto.getMaxParticipants());
        event.setClassification(dto.getClassification());
        event.setAcess(dto.getAcess());
        event.setPhoto(dto.getPhoto());
        event.setState(dto.getState());
        event.setInviteToken(dto.getInviteToken());
        event.setInviteCode(dto.getInviteCode());




        return event;
    }

    public Event toBasicEntity(EventDTO dto) {
        if (dto == null) {
            return null;
        }

        Event event = new Event();
        event.setName(dto.getName());
        event.setDateFixedStart(dto.getDateFixedStart());
        event.setDateStart(dto.getDateStart());
        event.setDateFixedEnd(dto.getDateFixedEnd());
        event.setDateEnd(dto.getDateEnd());
        event.setTimeFixedStart(dto.getTimeFixedStart());
        event.setTimeStart(dto.getTimeStart());
        event.setTimeFixedEnd(dto.getTimeFixedEnd());
        event.setTimeEnd(dto.getTimeEnd());
        event.setLocalization(dto.getLocalization());
        event.setDescription(dto.getDescription());
        event.setMaxParticipants(dto.getMaxParticipants());
        event.setClassification(dto.getClassification());
        event.setAcess(dto.getAcess());
        event.setPhoto(dto.getPhoto());
        event.setState(dto.getState());

        return event;
    }

    public EventDTO toDTOWithUserContext(Event event, Long currentUserId) {
        EventDTO dto = toDTO(event);
        
        if (dto != null && currentUserId != null) {

            if (event.getOwner() != null && event.getOwner().getId().equals(currentUserId)) {
                dto.setUserStatus("owner");
            } else if (event.getCollaborators() != null && 
                      event.getCollaborators().stream().anyMatch(c -> c.getId().equals(currentUserId))) {
                dto.setUserStatus("collaborator");
            } else if (event.getParticipants() != null && 
                      event.getParticipants().stream().anyMatch(p -> p.getUser().getId().equals(currentUserId))) {
                dto.setUserStatus("participant");
                

                dto.setUserConfirmed(event.getParticipants().stream()
                        .filter(p -> p.getUser().getId().equals(currentUserId))
                        .findFirst()
                        .map(p -> p.getCurrentStatus().name().equals("CONFIRMED"))
                        .orElse(false));
            } else {
                dto.setUserStatus("visitor");
            }
        }

        return dto;
    }

    public List<EventDTO> toDTOList(List<Event> events) {
        if (events == null) {
            return null;
        }

        return events.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> toDTOListWithUserContext(List<Event> events, Long currentUserId) {
        if (events == null) {
            return null;
        }

        return events.stream()
                .map(event -> toDTOWithUserContext(event, currentUserId))
                .collect(Collectors.toList());
    }

    public void updateEntity(Event event, EventDTO dto) {
        if (event == null || dto == null) {
            return;
        }

        event.setName(dto.getName());
        event.setDateFixedStart(dto.getDateFixedStart());
        event.setDateStart(dto.getDateStart());
        event.setDateFixedEnd(dto.getDateFixedEnd());
        event.setDateEnd(dto.getDateEnd());
        event.setTimeFixedStart(dto.getTimeFixedStart());
        event.setTimeStart(dto.getTimeStart());
        event.setTimeFixedEnd(dto.getTimeFixedEnd());
        event.setTimeEnd(dto.getTimeEnd());
        event.setLocalization(dto.getLocalization());
        event.setDescription(dto.getDescription());
        event.setMaxParticipants(dto.getMaxParticipants());
        event.setClassification(dto.getClassification());
        event.setAcess(dto.getAcess());
        event.setPhoto(dto.getPhoto());
        event.setState(dto.getState());
    }
}