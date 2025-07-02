package com.eventsphere.entity.event;

import com.eventsphere.entity.user.User;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class EventParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private ParticipantStatus currentStatus;

    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<ParticipantHistory> participantHistory = new ArrayList<>();    @Column(name = "is_collaborator", nullable = false)
    private boolean isCollaborator = false;

    @Column(name = "qr_code")
    private String qrCode;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public ParticipantStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(ParticipantStatus currentStatus) {
        this.currentStatus = currentStatus;
    }

    public List<ParticipantHistory> getParticipantHistory() {
        return participantHistory;
    }

    public void setParticipantHistory(List<ParticipantHistory> participantHistory) {
        this.participantHistory = participantHistory;
    }

    public boolean isCollaborator() {
        return isCollaborator;
    }

    public void setIsCollaborator(boolean isCollaborator) {
        this.isCollaborator = isCollaborator;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
}

