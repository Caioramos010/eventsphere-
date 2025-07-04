package com.eventsphere.service;

import com.eventsphere.dto.UserDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.user.Role;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ImageService imageService;

    @Autowired
    private ParticipantRepository participantRepository;

    public UserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(UserDTO userDTO) {
        if (userDTO == null) {
            throw new IllegalArgumentException("Dados do usuário não informados");
        }        if (userDTO.getUsername() == null || userDTO.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username é obrigatório");
        }
        if (userDTO.getUsername().length() < 3) {
            throw new IllegalArgumentException("Username deve ter pelo menos 3 caracteres");
        }
        if (userDTO.getName() == null || userDTO.getName().isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (userDTO.getName().length() < 2) {
            throw new IllegalArgumentException("Nome deve ter pelo menos 2 caracteres");
        }
        if (userDTO.getEmail() == null || userDTO.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email é obrigatório");
        }
        if (!userDTO.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Formato de email inválido");
        }
        if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória");
        }
        if (userRepository.findByUsername(userDTO.getUsername()) != null) {
            throw new IllegalArgumentException("Este username já está em uso");
        }
        if (userRepository.findByEmail(userDTO.getEmail()) != null) {
            throw new IllegalArgumentException("Este email já está cadastrado");
        }        if (!validatePassword(userDTO.getPassword())) {
            throw new IllegalArgumentException("Senha deve ter pelo menos 8 caracteres, incluindo: letra maiúscula, minúscula, número e caractere especial (@$!%*?&)");
        }
        userDTO.setRegisterDate(LocalDateTime.now());
        userDTO.setRoles(Set.of(Role.ROLE_USER.name()));
        String encodedPassword = passwordEncoder.encode(userDTO.getPassword());
        User user;
        if (userDTO.getPhoto() == null || userDTO.getPhoto().isEmpty()) {
            user = new User(userDTO.getUsername(), userDTO.getName(), userDTO.getRoles(), userDTO.getEmail(), userDTO.getRegisterDate());
        } else {
            user = new User(userDTO.getUsername(), userDTO.getName(), userDTO.getRoles(), userDTO.getEmail(), userDTO.getRegisterDate(), userDTO.getPhoto());
        }
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }    public User registerUserByInvite(UserDTO userDTO, String inviteToken, String inviteCode) {
        if (userDTO == null) {
            throw new IllegalArgumentException("Dados do usuário não informados");
        }
        if (inviteToken == null || inviteToken.isBlank() || inviteCode == null || inviteCode.isBlank()) {
            throw new IllegalArgumentException("Token e código do convite são obrigatórios");
        }
        
        Optional<Event> eventOptional = eventRepository.findByInviteToken(inviteToken);
        if (eventOptional.isEmpty()) {
            throw new IllegalArgumentException("Convite inválido - token não encontrado");
        }
        
        Event event = eventOptional.get();
        if (!event.getInviteCode().equals(inviteCode)) {
            throw new IllegalArgumentException("Convite inválido - código incorreto");
        }
        
        User user = registerUser(userDTO);
        
        if (event.getParticipants() == null) {
            event.setParticipants(new ArrayList<>());
        }
        
        boolean alreadyParticipating = event.getParticipants().stream()
                .anyMatch(p -> p.getUser().getUsername().equals(user.getUsername()));
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }
        
        EventParticipant participant = new EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(ParticipantStatus.INVITED);
        
        event.getParticipants().add(participant);
        eventRepository.save(event);
        
        return user;
    }

    public User getUser(Long userID){
        return userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
    }
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setPassword(null); 
        }
        return users;
    }

    public User updateName(Long userID, String newName) {
        getUser(userID).setName(newName);
        return userRepository.save(getUser(userID));
    }

    public User updateEmail(Long userID, String newEmail) {
        getUser(userID).setEmail(newEmail);
        return userRepository.save(getUser(userID));
    }

    public User updatePassword(Long userID, String currentPassword, String newPassword) {
        User user = getUser(userID);
        if (!validatePassword(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Senha atual incorreta");
        }
        if (validatePassword(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("A nova senha não pode ser igual à senha atual");
        }
        if (!validatePassword(newPassword)) {
            throw new IllegalArgumentException("A nova senha não atende aos requisitos de segurança");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public User updatePhoto(Long userID, String newPhoto) {
        getUser(userID).setPhoto(newPhoto);
        return userRepository.save(getUser(userID));
    }

    public User removePhoto(Long userID) {
        User user = getUser(userID);
        user.setPhoto(null);
        return userRepository.save(user);
    }
    public User updateUsername(Long userID, String newUsername) {
        getUser(userID).setUsername(newUsername);
        return userRepository.save(getUser(userID));
    }
    public void deleteUser(Long userID) {
        userRepository.deleteById(userID);
    }

    public void deleteUserWithPasswordCheck(Long userId, String password) {
        User user = getUser(userId);
        if (user == null || !validatePassword(password, user.getPassword())){
            throw new IllegalArgumentException("Senha inválida");
        }
        
        user.setBlocked(true);
        userRepository.save(user);
        
        List<EventParticipant> participations = participantRepository.findAll();
        for (EventParticipant ep : participations) {
            if (ep.getUser().getId().equals(userId)) {
                participantRepository.delete(ep);
            }
        }
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public boolean validatePassword(String password) {
        return password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    }

    public boolean validateNewPassword(String password, String newPassword) {
        return !password.equals(newPassword) && validatePassword(newPassword);
    }

    public boolean validateNewName(Long userID, String newName) {
        return getUser(userID).getName().equals(newName);
    }
    public boolean validateNewUsername(Long userID, String newUsername) {
        return getUser(userID).getName().equals(newUsername) && userRepository.findByUsername(newUsername) == null;
    }

    public boolean validateNewEmail(Long userID, String newEmail) {
        return getUser(userID).getEmail().equals(newEmail) && userRepository.findByUsername(newEmail) == null;
    }
    public boolean validateNewPhoto(Long userID, String newPhoto) {
        return getUser(userID).getPhoto().equals(newPhoto);
    }

    public Map<String, String> login(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Usuário e senha são obrigatórios");
        }
        User user = userRepository.findByUsername(username);
        if (user == null || !validatePassword(password, user.getPassword())) {
            throw new IllegalArgumentException("Usuário ou senha inválidos");
        }
        if (user.isBlocked()) {
            throw new IllegalArgumentException("Usuário bloqueado. Entre em contato com o suporte.");
        }
        authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(username, password));
        String token = jwtUtil.generateToken(username);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("token", token);
        return response;
    }

    public boolean validateInviteLogin(String username, String inviteToken, String inviteCode) {
        if (username == null || username.isBlank() || inviteToken == null || inviteToken.isBlank() || inviteCode == null || inviteCode.isBlank()) {
            return false;
        }
        Optional<Event> event = eventRepository.findByInviteToken(inviteToken);
        if (event.isEmpty() || !event.get().getInviteCode().equals(inviteCode)) {
            return false;
        }
        
        if (event.get().getParticipants() == null) return false;
        return event.get().getParticipants().stream().anyMatch(p -> p.getUser().getUsername().equals(username));
    }

    public Map<String, String> loginInvite(String username, String password, String inviteToken, String inviteCode) {
        
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Usuário e senha são obrigatórios");
        }
        if (inviteToken == null || inviteToken.isBlank()) {
            throw new IllegalArgumentException("Token do convite é obrigatório");
        }
        User user = userRepository.findByUsername(username);
        if (user == null || !validatePassword(password, user.getPassword())) {
            throw new IllegalArgumentException("Usuário ou senha inválidos");
        }
        
        return login(username, password);
    }    public Optional<User> getAuthenticatedUser(Long userID) {
        return userRepository.findById(userID);
    }

    
    public User updateUserPhoto(Long userId, String photoBase64) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        
        user.setPhoto(photoBase64);
        return userRepository.save(user);
    }

    
    public Map<String, Object> uploadUserPhoto(Long userId, org.springframework.web.multipart.MultipartFile file) {
        
        String base64Photo = imageService.convertToBase64(file);
        
        
        User updatedUser = updateUserPhoto(userId, base64Photo);
        
        Map<String, Object> response = new HashMap<>();
        response.put("photoBase64", base64Photo);
        response.put("success", true);
        
        return response;
    }

    public UserDTO getUserDisplay(Long userID) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        
        return UserDTO.forDisplay(
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getPhoto()
        );
    }

    public UserDTO getUserProfile(Long userID) {
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        
        return UserDTO.forProfile(
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getEmail(),
            user.getPhoto(),
            user.getRegisterDate(),
            user.isBlocked()
        );
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.isBlank()) return false;
            String username = jwtUtil.extractUsername(token);
            return (username != null && !username.isBlank());
        } catch (Exception e) {
            return false;
        }
    }
}





