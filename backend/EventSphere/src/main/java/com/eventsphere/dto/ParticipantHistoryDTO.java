package com.eventsphere.dto;

import com.eventsphere.entity.event.ParticipantStatus;

import java.util.ArrayList;
import java.util.List;

public class ParticipantHistoryDTO {
    private Long id;
    private Long eventId;
    private Long userId;
    private ParticipantStatus currentStatus;
    private List<ParticipantHistoryDTO> participantHistory = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public ParticipantStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(ParticipantStatus currentStatus) {
        this.currentStatus = currentStatus;
    }

    public List<ParticipantHistoryDTO> getParticipantHistory() {
        return participantHistory;
    }

    public void setParticipantHistory(List<ParticipantHistoryDTO> participantHistory) {
        this.participantHistory = participantHistory;
    }
}
