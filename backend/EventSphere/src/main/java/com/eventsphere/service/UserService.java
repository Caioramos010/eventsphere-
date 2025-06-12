package com.eventsphere.service;

import com.eventsphere.dto.UserDTO;
import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.user.Role;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.UserRepository;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    }

    public User registerUserByInvite(UserDTO userDTO, String inviteToken, String inviteCode) {
        if (userDTO == null) {
            throw new IllegalArgumentException("Dados do usuário não informados");
        }
        if (inviteToken == null || inviteToken.isBlank() || inviteCode == null || inviteCode.isBlank()) {
            throw new IllegalArgumentException("Token e código do convite são obrigatórios");
        }
        Event event = eventRepository.findByInviteToken(inviteToken);
        if (event == null || !event.getInviteCode().equals(inviteCode)) {
            throw new IllegalArgumentException("Convite inválido");
        }
        // Reaproveita validações do cadastro normal
        User user = registerUser(userDTO);
        // Adiciona o usuário como participante do evento
        if (event.getParticipants() == null) {
            event.setParticipants(new java.util.ArrayList<>());
        }
        boolean alreadyParticipating = event.getParticipants().stream().anyMatch(p -> p.getUser().getUsername().equals(user.getUsername()));
        if (alreadyParticipating) {
            throw new IllegalArgumentException("Usuário já é participante deste evento");
        }
        com.eventsphere.entity.event.EventParticipant participant = new com.eventsphere.entity.event.EventParticipant();
        participant.setEvent(event);
        participant.setUser(user);
        participant.setCurrentStatus(com.eventsphere.entity.event.ParticipantStatus.INVITED);
        event.getParticipants().add(participant);
        eventRepository.save(event);
        return user;
    }

    public User getUser(Long userID){
        return userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
    }
    public User getUserDisplay(Long userID) {
        User user = userRepository.findById(userID).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado!"));
        user.setPassword(null); // Remove a senha da resposta
        return user;
    }
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setPassword(null); // Remove a senha da resposta
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
    public User updateUsername(Long userID, String newUsername) {
        getUser(userID).setUsername(newUsername);
        return userRepository.save(getUser(userID));
    }
    public void deleteUser(Long userID) {
        userRepository.deleteById(userID);
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
        Event event = eventRepository.findByInviteToken(inviteToken);
        if (event == null || !event.getInviteCode().equals(inviteCode)) {
            return false;
        }
        // Verifica se o usuário está na lista de participantes do evento
        if (event.getParticipants() == null) return false;
        return event.getParticipants().stream().anyMatch(p -> p.getUser().getUsername().equals(username));
    }

    public Map<String, String> loginInvite(String username, String password, String inviteToken, String inviteCode) {
        // Agora faz login normal, sem exigir inviteCode
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
        // Não precisa mais validar código do evento, login normal
        return login(username, password);
    }

    public Optional<User> getAuthenticatedUser(Long userID) {
        return userRepository.findById(userID);
    }
}





