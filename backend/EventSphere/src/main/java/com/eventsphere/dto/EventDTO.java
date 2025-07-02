package com.eventsphere.dto;

import com.eventsphere.entity.event.Acess;
import com.eventsphere.entity.event.State;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class EventDTO {
    private Long id;

    private String name;
    private LocalDate dateFixedStart;
    private LocalDate dateStart;
    private LocalDate dateFixedEnd;
    private LocalDate dateEnd;
    private LocalTime timeFixedStart;
    private LocalTime timeStart;
    private LocalTime timeFixedEnd;
    private LocalTime timeEnd;
    private String localization;
    private String description;
    private int maxParticipants;
    private int classification;
    private Acess acess;
    private String photo;
    private State state;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhoto;
    private List<Long> collaboratorIds;
    private List<Long> participantIds;
    private String userStatus;
    private boolean userConfirmed;
    private List<ParticipantDTO> participants;
    private String inviteToken;
    private String inviteCode;
    private boolean canEdit; 


    public EventDTO() {
    }
    public EventDTO(String name, LocalDate dateFixedStart, LocalDate dateStart, LocalDate dateFixedEnd, LocalDate dateEnd, LocalTime timeFixedStart, LocalTime timeStart, LocalTime timeFixedEnd, LocalTime timeEnd, String localization, String description, int maxParticipants, int classification, Acess acess, String photo, State state) {
        this.name = name;
        this.dateFixedStart = dateFixedStart;
        this.dateFixedEnd = dateFixedEnd;
        this.timeFixedStart = timeFixedStart;
        this.timeFixedEnd = timeFixedEnd;
        this.localization = localization;
        this.description = description;
        this.maxParticipants = maxParticipants;
        this.classification = classification;
        this.acess = acess;
        this.photo = photo;
        this.state = state;
    }
    public EventDTO(String name, LocalDate dateFixedStart, LocalDate dateStart, LocalDate dateFixedEnd, LocalDate dateEnd, LocalTime timeFixedStart, LocalTime timeStart, LocalTime timeFixedEnd, LocalTime timeEnd, String localization, String description, int maxParticipants, int classification, Acess acess, State state) {
        this.name = name;
        this.dateFixedStart = dateFixedStart;
        this.dateFixedEnd = dateFixedEnd;
        this.timeFixedStart = timeFixedStart;
        this.timeFixedEnd = timeFixedEnd;
        this.localization = localization;
        this.description = description;
        this.maxParticipants = maxParticipants;
        this.classification = classification;
        this.acess = acess;
        this.state = state;
    }
    public EventDTO(String name, LocalDate dateFixedStart, LocalDate dateStart, LocalDate dateFixedEnd, LocalDate dateEnd, LocalTime timeFixedStart, LocalTime timeStart, LocalTime timeFixedEnd, LocalTime timeEnd, String localization, String description, int maxParticipants, int classification, Acess acess) {
        this.name = name;
        this.dateFixedStart = dateFixedStart;
        this.dateFixedEnd = dateFixedEnd;
        this.timeFixedStart = timeFixedStart;
        this.timeFixedEnd = timeFixedEnd;
        this.localization = localization;
        this.description = description;
        this.maxParticipants = maxParticipants;
        this.classification = classification;
        this.acess = acess;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getDateFixedStart() {
        return dateFixedStart;
    }

    public void setDateFixedStart(LocalDate dateFixedStart) {
        this.dateFixedStart = dateFixedStart;
    }

    public LocalDate getDateStart() {
        return dateStart;
    }

    public void setDateStart(LocalDate dateStart) {
        this.dateStart = dateStart;
    }

    public LocalDate getDateFixedEnd() {
        return dateFixedEnd;
    }

    public void setDateFixedEnd(LocalDate dateFixedEnd) {
        this.dateFixedEnd = dateFixedEnd;
    }

    public LocalDate getDateEnd() {
        return dateEnd;
    }

    public void setDateEnd(LocalDate dateEnd) {
        this.dateEnd = dateEnd;
    }

    public LocalTime getTimeFixedStart() {
        return timeFixedStart;
    }

    public void setTimeFixedStart(LocalTime timeFixedStart) {
        this.timeFixedStart = timeFixedStart;
    }

    public LocalTime getTimeStart() {
        return timeStart;
    }

    public void setTimeStart(LocalTime timeStart) {
        this.timeStart = timeStart;
    }

    public LocalTime getTimeFixedEnd() {
        return timeFixedEnd;
    }

    public void setTimeFixedEnd(LocalTime timeFixedEnd) {
        this.timeFixedEnd = timeFixedEnd;
    }

    public LocalTime getTimeEnd() {
        return timeEnd;
    }

    public void setTimeEnd(LocalTime timeEnd) {
        this.timeEnd = timeEnd;
    }

    public String getLocalization() {
        return localization;
    }

    public void setLocalization(String localization) {
        this.localization = localization;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public int getClassification() {
        return classification;
    }

    public void setClassification(int classification) {
        this.classification = classification;
    }

    public Acess getAcess() {
        return acess;
    }

    public void setAcess(Acess acess) {
        this.acess = acess;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getOwnerPhoto() {
        return ownerPhoto;
    }

    public void setOwnerPhoto(String ownerPhoto) {
        this.ownerPhoto = ownerPhoto;
    }

    public List<Long> getCollaboratorIds() {
        return collaboratorIds;
    }

    public void setCollaboratorIds(List<Long> collaboratorIds) {
        this.collaboratorIds = collaboratorIds;
    }

    public List<Long> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<Long> participantIds) {
        this.participantIds = participantIds;
    }

    public String getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(String userStatus) {
        this.userStatus = userStatus;
    }

    public boolean isUserConfirmed() {
        return userConfirmed;
    }

    public void setUserConfirmed(boolean userConfirmed) {
        this.userConfirmed = userConfirmed;
    }

    public List<ParticipantDTO> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ParticipantDTO> participants) {
        this.participants = participants;
    }

    public String getInviteToken() {
        return inviteToken;
    }

    public void setInviteToken(String inviteToken) {
        this.inviteToken = inviteToken;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public boolean isCanEdit() {
        return canEdit;
    }

    public void setCanEdit(boolean canEdit) {
        this.canEdit = canEdit;
    }
}
