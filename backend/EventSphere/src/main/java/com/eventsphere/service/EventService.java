package com.eventsphere.service;

import com.eventsphere.dto.EventDTO;
import com.eventsphere.dto.ParticipantDTO;
import com.eventsphere.entity.event.Acess;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.event.State;
import com.eventsphere.entity.user.User;
import com.eventsphere.mapper.EventMapper;
import com.eventsphere.mapper.ParticipantMapper;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.utils.EventCodeGenerator;        
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
public class EventService {
    
    private static final Logger logger = Logger.getLogger(EventService.class.getName());
    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private EventMapper eventMapper;

    @Autowired
    private ParticipantMapper participantMapper;

    @Autowired
    private ImageService imageService;    public Event registerEvent(EventDTO eventDTO) {
        eventDTO.setState(State.CREATED);
        User owner = null;
        if (eventDTO.getOwnerId() != null) {
            owner = userRepository.findById(eventDTO.getOwnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Dono do evento não encontrado!"));
        } else {
            throw new IllegalArgumentException("OwnerId é obrigatório no DTO");
        }
        
        Event event = eventMapper.toBasicEntity(eventDTO);
        event.setOwner(owner);
        
        event = eventRepository.save(event);
          
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        
        
        EventParticipant ownerParticipant = new EventParticipant();
        ownerParticipant.setEvent(event);
        ownerParticipant.setUser(owner);
        ownerParticipant.setCurrentStatus(ParticipantStatus.CONFIRMED);
        ownerParticipant.setIsCollaborator(false); 
        
        
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(ownerParticipant);
        history.setStatus(ParticipantStatus.CONFIRMED);
        history.setChangeTimestamp(LocalDateTime.now());
        
        if (ownerParticipant.getParticipantHistory() == null) {
            ownerParticipant.setParticipantHistory(new ArrayList<>());
        }
        ownerParticipant.getParticipantHistory().add(history);
        
        
        event.getParticipants().add(ownerParticipant);
        
        
        participantRepository.save(ownerParticipant);
        
        
        return eventRepository.save(event);
    }
    
    public void checkPermission(Long eventID, Long userId) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        
        boolean isOwner = event.getOwner().getId().equals(userId);
        if (isOwner) {
            return; 
        }
        
        boolean isCollaborator = false;
        if (event.getCollaborators() != null) {
            isCollaborator = event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userId));
        }
        
        if (!isCollaborator) {
            throw new SecurityException("Apenas o dono ou colaborador pode realizar esta operação.");
        }
    }

    public Event updateEvent(Long eventID, EventDTO eventDTO, Long userId) {
        checkPermission(eventID, userId);
        
        LocalDate startDate = eventDTO.getDateFixedStart();
        LocalDate endDate = eventDTO.getDateFixedEnd() != null ? eventDTO.getDateFixedEnd() : eventDTO.getDateFixedStart();
        LocalTime startTime = eventDTO.getTimeFixedStart();
        LocalTime endTime = eventDTO.getTimeFixedEnd();
        if (startDate == null || startTime == null || endDate == null || endTime == null) {
            throw new IllegalArgumentException("Data e hora de início e fim são obrigatórias");
        }
        LocalDateTime startDateTime = LocalDateTime.of(startDate, startTime);
        LocalDateTime endDateTime = LocalDateTime.of(endDate, endTime);
        if (!endDateTime.isAfter(startDateTime)) {
            throw new IllegalArgumentException("A data/hora de término deve ser posterior à data/hora de início");
        }
        Optional<Event> optionalEvent = eventRepository.findById(eventID);
        if (optionalEvent.isEmpty()){
            throw new IllegalArgumentException("Evento não encontrado!");
        }
        Event event = optionalEvent.get();
        event.setName(eventDTO.getName());
        event.setDateFixedStart(eventDTO.getDateFixedStart());
        event.setDateFixedEnd(eventDTO.getDateFixedEnd());
        event.setLocalization(eventDTO.getLocalization());
        event.setDescription(eventDTO.getDescription());
        event.setMaxParticipants(eventDTO.getMaxParticipants());
        event.setClassification(eventDTO.getClassification());
        event.setAcess(eventDTO.getAcess());
        if (eventDTO.getOwnerId() != null && !event.getOwner().getId().equals(eventDTO.getOwnerId())) {
            User newOwner = userRepository.findById(eventDTO.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("Novo dono do evento não encontrado!"));
            event.setOwner(newOwner);
        }
        if (eventDTO.getPhoto() != null && !eventDTO.getPhoto().isEmpty()) {
            event.setPhoto(eventDTO.getPhoto());
        }
        return eventRepository.save(event);
    }

    public Event getEvent(Long eventID) {
        return eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
    }

    public Event deleteEvent(Long eventID) {
        Event event = getEvent(eventID);
        eventRepository.delete(event);
        return event;
    }
    
    @Scheduled(fixedRate = 60000) 
    public void autoStartEvents() {
        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo"));
        
        logger.info("Auto-starting events check - Current time: " + now + ", events to check: " + events.size());
        
        for (Event event : events) {
            if (event.getState() == State.CREATED) {
                LocalDateTime fixedStart = LocalDateTime.of(event.getDateFixedStart(), event.getTimeFixedStart());
                
                logger.fine("Event: " + event.getName() + " - Scheduled: " + fixedStart + " - Current: " + now + " - Should start: " + (now.isAfter(fixedStart) || now.isEqual(fixedStart)));
                
                if (now.isAfter(fixedStart) || now.isEqual(fixedStart)) {
                    logger.info("Auto-starting event: " + event.getName());
                    event.setState(State.ACTIVE);
                    if (event.getDateStart() == null) {
                        event.setDateStart(now.toLocalDate());
                        event.setTimeStart(now.toLocalTime());
                    }
                    eventRepository.save(event);
                }
            }
        }
    }
    
    @Scheduled(fixedRate = 60000) 
    public void autoFinishEvents() {
        List<Event> events = eventRepository.findAll();
        LocalDateTime now = LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo"));
        
        for (Event event : events) {
            if (event.getState() == State.ACTIVE) {
                LocalDateTime fixedEnd = LocalDateTime.of(event.getDateFixedEnd(), event.getTimeFixedEnd());
                if (now.isAfter(fixedEnd) || now.isEqual(fixedEnd)) {
                    event.setState(State.FINISHED);
                    if (event.getDateEnd() == null) {
                        event.setDateEnd(now.toLocalDate());
                        event.setTimeEnd(now.toLocalTime());
                    }
                    eventRepository.save(event);
                }
            }
        }
    }



    public Event startEvent(Long eventID, Long userId) {
        checkPermission(eventID, userId);
        Event event = getEvent(eventID);
        if (!event.getState().equals(State.CREATED)) {
            throw new IllegalStateException("Evento não está no estado criado");
        }
        event.setState(State.ACTIVE);
        event.setDateStart(LocalDate.now());
        event.setTimeStart(LocalTime.now());
        return eventRepository.save(event);
    }

    public Event finishEvent(Long eventID, Long userId) {
        checkPermission(eventID, userId);
        Event event = getEvent(eventID);
        if (!event.getState().equals(State.ACTIVE)) {
            throw new IllegalStateException("Evento não está no estado ativo");
        }
        event.setState(State.FINISHED);
        event.setDateEnd(LocalDate.now());
        event.setTimeEnd(LocalTime.now());
        return eventRepository.save(event);
    }    public Event cancelEvent(Long eventID, Long userId) {
        checkPermission(eventID, userId);
        Event event = getEvent(eventID);
        if (!(event.getState().equals(State.ACTIVE) || event.getState().equals(State.CREATED))) {
            throw new IllegalStateException("Evento só pode ser cancelado se estiver nos estados CREATED ou ACTIVE");
        }
        event.setState(State.CANCELED);
        return eventRepository.save(event);
    }
      public void authorizeEditEvent(Long eventID, Long userId) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        
        
        boolean isOwner = event.getOwner().getId().equals(userId);
        if (isOwner) {
            return; 
        }
        
        
        boolean isCollaborator = false;
        if (event.getCollaborators() != null) {
            isCollaborator = event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userId));
        }
        
        if (!isCollaborator) {
            throw new SecurityException("Apenas o dono ou colaborador pode editar o evento ou criar convites.");
        }
    }
    
    private String generateInviteToken() {
        byte[] randomBytes = new byte[24];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public String generateInviteLink(Long eventId, Long userId) {
        Event event = getEvent(eventId);
        
        authorizeInviteCreation(eventId, userId);
        
        if (event.getInviteToken() != null && !event.getInviteToken().isEmpty()) {
            return event.getInviteToken();
        }
          
        String inviteToken = UUID.randomUUID().toString();
        event.setInviteToken(inviteToken);
        
        
        String inviteCode = generateSecureInviteCode();
        event.setInviteCode(inviteCode);
        
        eventRepository.save(event);
        
        return inviteToken;
    }
    
    private String generateSecureInviteCode() {
        
        Set<String> existingCodes = eventRepository.findAll()
                .stream()
                .map(Event::getInviteCode)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        return EventCodeGenerator.generateEventCode(existingCodes);
    }

    public EventDTO validateInviteToken(String inviteToken) {
        Event event = eventRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new IllegalArgumentException("Token de convite inválido ou expirado"));
        
        
        if (event.getState() == State.CANCELED) {
            throw new IllegalArgumentException("Este evento foi cancelado");
        }
        
        return eventMapper.toDTO(event);
    }

    public Event validateInviteTokenAndGetEvent(String inviteToken) {
        Event event = eventRepository.findByInviteToken(inviteToken)
                .orElseThrow(() -> new IllegalArgumentException("Token de convite inválido ou expirado"));
        
        
        if (event.getState() == State.CANCELED) {
            throw new IllegalArgumentException("Este evento foi cancelado");
        }
        
        return event;
    }

    
    public Event addCollaborator(Long eventID, Long userID, Long requesterId) {
        checkPermission(eventID, requesterId);
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        if (event.getCollaborators() == null) {
            event.setCollaborators(new java.util.ArrayList<>());
        }
        boolean alreadyCollaborator = event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userID));
        if (alreadyCollaborator) {
            throw new IllegalArgumentException("Usuário já é colaborador deste evento");
        }
        event.getCollaborators().add(user);
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventID, userID);
        if (participant == null) {
            participant = new EventParticipant();
            participant.setEvent(event);
            participant.setUser(user);
            participant.setCurrentStatus(com.eventsphere.entity.event.ParticipantStatus.INVITED);
        }
        participant.setIsCollaborator(true);
        participantRepository.save(participant);
        return eventRepository.save(event);
    }


    public User getAuthenticatedUser(String username) {
        return userRepository.findByUsername(username);
    }   

    @Deprecated
    public List<EventDTO> getMyEvents(Long userId) {
        List<Event> ownedEvents = eventRepository.findByOwnerId(userId);
        List<Event> participantEvents = eventRepository.findAllMyEvents(userId);
        
        
        Set<Event> allEvents = new HashSet<>();
        allEvents.addAll(ownedEvents);
        allEvents.addAll(participantEvents);
        
        return eventMapper.toDTOList(new ArrayList<>(allEvents));
    }

    @Deprecated
    public List<EventDTO> getPublicEvents() {
        List<Event> events = eventRepository.findAllpublicEvents();
        return eventMapper.toDTOList(events);
    }   

    public EventDTO getEventWithUserInfo(Long eventID, Long userId) {
        Event event = getEvent(eventID);
        return eventMapper.toDTOWithUserContext(event, userId);
    }

    public List<EventDTO> getMyEventsWithUserInfo(Long userId, String state, String sort) {
        logger.info("Buscando eventos para usuário: " + userId + ", state: " + state + ", sort: " + sort);
        
        List<Event> ownedEvents = eventRepository.findByOwnerId(userId);
        List<Event> participantEvents = eventRepository.findEventsByParticipantUserId(userId);
        
        logger.info("Eventos próprios encontrados: " + ownedEvents.size());
        logger.info("Eventos como participante encontrados: " + participantEvents.size());
        
        Set<Event> allEvents = new HashSet<>();
        allEvents.addAll(ownedEvents);
        allEvents.addAll(participantEvents);
        
        List<Event> filteredEvents = new ArrayList<>(allEvents);
        logger.info("Total de eventos únicos: " + filteredEvents.size());
        
        
        if (state != null && !state.isEmpty() && !"all".equalsIgnoreCase(state)) {
            try {
                State stateEnum = State.valueOf(state.toUpperCase());
                logger.info("Aplicando filtro de estado: " + stateEnum);
                
                filteredEvents = filteredEvents.stream()
                    .filter(event -> {
                        boolean matches = event.getState() == stateEnum;
                        logger.info("Evento " + event.getId() + " (" + event.getName() + ") - Estado: " + event.getState() + ", Corresponde ao filtro: " + matches);
                        return matches;
                    })
                    .collect(Collectors.toList());
                
                logger.info("Eventos após filtro de estado: " + filteredEvents.size());
            } catch (IllegalArgumentException e) {
                logger.warning("Invalid state parameter: " + state);
            }
        }
        
        
        if (sort != null && !sort.isEmpty()) {
            logger.info("Aplicando ordenação: " + sort);
            if ("date_asc".equalsIgnoreCase(sort)) {
                filteredEvents.sort(Comparator.comparing(event -> 
                    LocalDateTime.of(event.getDateFixedStart(), event.getTimeFixedStart())));
            } else if ("date_desc".equalsIgnoreCase(sort)) {
                filteredEvents.sort((event1, event2) -> 
                    LocalDateTime.of(event2.getDateFixedStart(), event2.getTimeFixedStart())
                        .compareTo(LocalDateTime.of(event1.getDateFixedStart(), event1.getTimeFixedStart())));
            }
        }
        
        logger.info("Retornando " + filteredEvents.size() + " eventos após filtragem e ordenação");
        return eventMapper.toDTOListWithUserContext(filteredEvents, userId);
    }
    
    public List<EventDTO> getAllMyEventsWithUserInfo(Long userId) {
        
        List<Event> ownedEvents = eventRepository.findByOwnerId(userId);
        List<Event> participantEvents = eventRepository.findEventsByParticipantUserId(userId);
        Set<Event> allEvents = new HashSet<>();
        allEvents.addAll(ownedEvents);
        allEvents.addAll(participantEvents);
        
        
        List<Event> filteredEvents = allEvents.stream()
            .filter(event -> event.getState() != State.FINISHED && event.getState() != State.CANCELED)
            .collect(Collectors.toList());
        
        return eventMapper.toDTOListWithUserContext(filteredEvents, userId);
    }
    
    public List<EventDTO> getPublicEventsWithUserInfo(Long userId, String state, String sort) {
        List<Event> events = eventRepository.findByAcess(Acess.PUBLIC);
        if (events.isEmpty()) {
            return new ArrayList<>();
        }
        
        
        events = events.stream()
            .filter(event -> event.getState() != State.FINISHED && event.getState() != State.CANCELED)
            .collect(Collectors.toList());
        
        
        if (state != null && !state.isEmpty()) {
            try {
                State stateEnum = State.valueOf(state.toUpperCase());
                events = events.stream()
                    .filter(event -> event.getState() == stateEnum)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                logger.warning("Invalid state parameter: " + state);
            }
        }
        
        
        if (sort != null && !sort.isEmpty()) {
            if ("date_asc".equalsIgnoreCase(sort)) {
                events.sort(Comparator.comparing(event -> 
                    LocalDateTime.of(event.getDateFixedStart(), event.getTimeFixedStart())));
            } else if ("date_desc".equalsIgnoreCase(sort)) {
                events.sort((event1, event2) -> 
                    LocalDateTime.of(event2.getDateFixedStart(), event2.getTimeFixedStart())
                        .compareTo(LocalDateTime.of(event1.getDateFixedStart(), event1.getTimeFixedStart())));
            }
        }
        
        return eventMapper.toDTOListWithUserContext(events, userId);
    }

    public Event updateEventPhoto(Long eventId, String base64Image) {
        Event event = getEvent(eventId);
        event.setPhoto(base64Image);
        return eventRepository.save(event);
    }
    
    public List<EventDTO> getParticipatingEventsForUser(Long userId) {
        List<Event> events = eventRepository.findEventsByParticipantUserId(userId);
        return eventMapper.toDTOListWithUserContext(events, userId);
    }

    public Map<String, Object> uploadEventImage(Long eventId, org.springframework.web.multipart.MultipartFile file, Long userId) {
        authorizeEditEvent(eventId, userId);
        String base64Image = imageService.convertToBase64(file);
        Event updatedEvent = updateEventPhoto(eventId, base64Image);
        Map<String, Object> response = new HashMap<>();
        response.put("imageBase64", base64Image);
        response.put("eventId", eventId);
        response.put("success", true);
        
        return response;
    }
    

    public EventDTO validateEventCode(String eventCode) {
        try {
            if (!EventCodeGenerator.isValidCodeFormat(eventCode)) {
                throw new IllegalArgumentException("Código de evento inválido. Deve conter 8 caracteres (letras e números).");
            }
            Event event = eventRepository.findByInviteCode(eventCode);
            if (event == null) {
                throw new EntityNotFoundException("Evento não encontrado com o código fornecido.");
            }
            if (event.getState() == State.CANCELED) {
                throw new IllegalStateException("Este evento foi cancelado.");
            }
            if (event.getState() == State.FINISHED) {
                throw new IllegalStateException("Este evento já foi finalizado.");
            }
            return eventMapper.toDTO(event);
        } catch (Exception e) {
            logger.severe("Erro ao validar código do evento: " + e.getMessage());
            throw e;
        }
    }
    
    public Event validateEventCodeAndGetEvent(String eventCode) {
        if (!EventCodeGenerator.isValidCodeFormat(eventCode)) {
            throw new IllegalArgumentException("Código de evento inválido. Deve conter 8 caracteres (letras e números).");
        }
        Event event = eventRepository.findByInviteCode(eventCode);
        if (event == null) {
            throw new IllegalArgumentException("Evento não encontrado com o código fornecido.");
        }
        if (event.getState() == State.CANCELED) {
            throw new IllegalStateException("Este evento foi cancelado.");
        }
        if (event.getState() == State.FINISHED) {
            throw new IllegalStateException("Este evento já foi finalizado.");
        }
        return event;
    }
    
    public List<EventDTO> getNextEventsWithUserInfo(Long userId) {
        List<State> excludedStates = Arrays.asList(State.FINISHED, State.CANCELED);
        List<Event> ownedEvents = eventRepository.findByOwnerIdAndStateNotIn(userId, excludedStates);
        List<Event> participantEvents = eventRepository.findByParticipantsUserIdAndStateNot(userId, State.FINISHED);
        participantEvents = participantEvents.stream()
            .filter(e -> !excludedStates.contains(e.getState()))
            .collect(Collectors.toList());
        Set<Event> allEvents = new HashSet<>();
        allEvents.addAll(ownedEvents);
        allEvents.addAll(participantEvents);
        return eventMapper.toDTOListWithUserContext(new ArrayList<>(allEvents), userId);
    }
    
    public List<EventDTO> getNextPublicEventsWithUserInfo(Long userId) {
        List<State> excludedStates = Arrays.asList(State.FINISHED, State.CANCELED);
        List<Event> publicEvents = eventRepository.findByAcessAndStateNotIn(com.eventsphere.entity.event.Acess.PUBLIC, excludedStates);  
        return eventMapper.toDTOListWithUserContext(publicEvents, userId);
    }
    
    public void authorizeInviteCreation(Long eventID, Long userId) {
        Event event = eventRepository.findById(eventID)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        boolean isOwner = event.getOwner().getId().equals(userId);
        if (isOwner) {
            return; 
        }
        boolean isCollaborator = false;
        if (event.getCollaborators() != null) {
            isCollaborator = event.getCollaborators().stream().anyMatch(u -> u.getId().equals(userId));
        }
        if (isCollaborator) {
            return;
        }
        

        if ("PUBLIC".equals(event.getAcess())) {
            boolean isParticipant = false;
            if (event.getParticipants() != null) {
                isParticipant = event.getParticipants().stream().anyMatch(p -> p.getUser().getId().equals(userId));
            }
            if (isParticipant) {
                return;
            }
        }
        throw new SecurityException("Apenas donos, colaboradores ou participantes de eventos públicos podem criar convites.");
    }
    
    public EventDTO validateEventCodeSimple(String eventCode) {
        try {

            if (!EventCodeGenerator.isValidCodeFormat(eventCode)) {
                throw new IllegalArgumentException("Código de evento inválido. Deve conter 8 caracteres (letras e números).");
            }
            
            Event event = eventRepository.findByInviteCode(eventCode);
            
            if (event == null) {
                throw new EntityNotFoundException("Evento não encontrado com o código fornecido.");
            }
            if (event.getState() == State.CANCELED) {
                throw new IllegalStateException("Este evento foi cancelado.");
            }
            if (event.getState() == State.FINISHED) {
                throw new IllegalStateException("Este evento já foi finalizado.");
            }
            EventDTO dto = eventMapper.toDTO(event);
            if (dto.getParticipants() == null) {
                dto.setCollaboratorIds(new ArrayList<>());
                dto.setParticipantIds(new ArrayList<>());
                dto.setParticipants(new ArrayList<>());
            }
            return dto;
        } catch (Exception e) {
            logger.severe("Erro ao validar código do evento: " + e.getMessage());
            throw e;
        }
    }
    
    public String ensureEventHasInviteCode(Long eventId) {
        Event event = getEvent(eventId);
        if (event.getInviteCode() == null || event.getInviteCode().isEmpty()) {
            String inviteCode = generateSecureInviteCode();
            event.setInviteCode(inviteCode);
            eventRepository.save(event);
            logger.info("Generated invite code for event " + eventId + ": " + inviteCode);
        }
        return event.getInviteCode();
    }
}