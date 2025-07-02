package com.eventsphere.mapper;

import com.eventsphere.dto.ParticipantDTO;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ParticipantMapper {

    public ParticipantDTO toDTO(EventParticipant participant) {
        if (participant == null) {
            return null;
        }
        ParticipantDTO dto = new ParticipantDTO();
        dto.setId(participant.getId());
        dto.setEventId(participant.getEvent().getId());
        dto.setUserId(participant.getUser().getId());
        dto.setUserName(participant.getUser().getName());
        dto.setUserUsername(participant.getUser().getUsername());
        dto.setUserEmail(participant.getUser().getEmail());
        dto.setUserPhoto(participant.getUser().getPhoto());
        dto.setCurrentStatus(participant.getCurrentStatus());
        dto.setIsCollaborator(participant.isCollaborator());
        dto.setStatus(participant.getCurrentStatus().name());
        dto.setConfirmed(participant.getCurrentStatus() == ParticipantStatus.CONFIRMED);
        dto.setQrCode(participant.getQrCode());
        return dto;
    }

    public List<ParticipantDTO> toDTOList(List<EventParticipant> participants) {
        if (participants == null) {
            return null;
        }
        return participants.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ParticipantDTO> toDTOListByStatus(List<EventParticipant> participants, ParticipantStatus status) {
        if (participants == null) {
            return null;
        }
        return participants.stream()
                .filter(p -> p.getCurrentStatus() == status)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ParticipantDTO> toConfirmedDTOList(List<EventParticipant> participants) {
        return toDTOListByStatus(participants, ParticipantStatus.CONFIRMED);
    }

    public List<ParticipantDTO> toPendingDTOList(List<EventParticipant> participants) {
        return toDTOListByStatus(participants, ParticipantStatus.PENDING);
    }

    public List<ParticipantDTO> toCollaboratorDTOList(List<EventParticipant> participants) {
        if (participants == null) {
            return null;
        }
        return participants.stream()
                .filter(EventParticipant::isCollaborator)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long countByStatus(List<EventParticipant> participants, ParticipantStatus status) {
        if (participants == null) {
            return 0;
        }
        return participants.stream()
                .filter(p -> p.getCurrentStatus() == status)
                .count();
    }

    public long countConfirmed(List<EventParticipant> participants) {
        return countByStatus(participants, ParticipantStatus.CONFIRMED);
    }

    public long countPending(List<EventParticipant> participants) {
        return countByStatus(participants, ParticipantStatus.PENDING);
    }

    public long countCollaborators(List<EventParticipant> participants) {
        if (participants == null) {
            return 0;
        }
        return participants.stream()
                .filter(EventParticipant::isCollaborator)
                .count();
    }
}