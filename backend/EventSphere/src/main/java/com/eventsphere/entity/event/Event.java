package com.eventsphere.entity.event;

import com.eventsphere.entity.user.User;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private LocalDate dateFixedStart;
    private LocalDate dateStart;
    @Column(nullable = false)
    private LocalDate dateFixedEnd;
    private LocalDate dateEnd;
    @Column(nullable = false)
    private LocalTime timeFixedStart;
    private LocalTime timeStart;
    @Column(nullable = false)
    private LocalTime timeFixedEnd;
    private LocalTime timeEnd;
    @Column(nullable = false)
    private String localization;
    @Column(nullable = false)
    private String description;
    private int maxParticipants;
    private int classification;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Acess acess;
    private String photo;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private State state;
    @ManyToOne(optional = false)
    private User owner;
    @ManyToMany
    @JoinTable(
            name = "event_collaborators",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> collaborators;


    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventParticipant> participants;

    @Column(unique = true)
    private String inviteToken;

    private String inviteCode;

    public Event(String name, LocalDate dateFixedStart, LocalDate dateFixedEnd, LocalTime timeFixedStart, LocalTime timeFixedEnd, String localization, String description, int maxParticipants, int classification, Acess acess, String photo, State state, User owner) {
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
        this.owner = owner;
    }

    public Event(String name, LocalDate dateFixedStart, LocalDate dateFixedEnd, LocalTime timeFixedStart, LocalTime timeFixedEnd, String localization, String description, int maxParticipants, int classification, Acess acess, State state, User owner) {
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
        this.owner = owner;
    }

    public Event() {

    }

    public Long getId() {
        return id;
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

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public List<User> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(List<User> collaborators) {
        this.collaborators = collaborators;
    }

    public List<EventParticipant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<EventParticipant> participants) {
        this.participants = participants;
    }
    public LocalDateTime getDate(){
    if (dateStart == null || timeStart == null){
        return LocalDateTime.of(dateFixedStart, timeFixedStart);
    }
        return LocalDateTime.of(dateStart, timeStart);
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
}
