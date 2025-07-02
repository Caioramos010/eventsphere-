package com.eventsphere.dto;

import com.eventsphere.entity.event.ParticipantStatus;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ParticipantDTO {
    private Long id;
    private Long eventId;
    private Long userId;
    private String userName;
    private String userUsername;
    private String userEmail;
    private String userPhoto;
    private ParticipantStatus currentStatus;
    
    @JsonProperty("isCollaborator")
    private boolean isCollaborator;
    
    private String status;
    private boolean confirmed;
    private String qrCode;
    
    public ParticipantDTO() {
    }

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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserUsername() {
        return userUsername;
    }

    public void setUserUsername(String userUsername) {
        this.userUsername = userUsername;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserPhoto() {
        return userPhoto;
    }

    public void setUserPhoto(String userPhoto) {
        this.userPhoto = userPhoto;
    }

    @JsonProperty("isCollaborator")
    public boolean isCollaborator() {
        return isCollaborator;
    }

    public void setIsCollaborator(boolean isCollaborator) {
        this.isCollaborator = isCollaborator;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isConfirmed() {
        return confirmed;
    }

    public void setConfirmed(boolean confirmed) {
        this.confirmed = confirmed;
    }

    public ParticipantStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(ParticipantStatus currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
}
