package com.eventsphere.service;

import com.eventsphere.entity.event.Event;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.EventRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;


@Service
public class FileStorageService {
    private Path fileStorageLocation;
    private UserRepository userRepository;
    private EventRepository eventRepository;
    private EventService eventService;

    
    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir, UserRepository userRepository, EventRepository eventRepository, EventService eventService) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.eventService = eventService;
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Não foi possível criar o diretório de upload", ex);
        }
    }

    
    public String storeFile(MultipartFile file) {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Erro ao armazenar arquivo", ex);
        }
    }

    
    public boolean fileExists(String fileName) {
        return Files.exists(this.fileStorageLocation.resolve(fileName));
    }

    
    public void deleteFile(String fileName) {
        try {
            Files.deleteIfExists(this.fileStorageLocation.resolve(fileName));
        } catch (IOException ex) {
            throw new RuntimeException("Erro ao excluir arquivo", ex);
        }
    }

    
    public String storeUserPhoto(MultipartFile file, User user) {
        String fileName = storeFile(file);
        user.setPhoto(fileName);
        userRepository.save(user);
        return fileName;
    }

    
    public String storeEventImage(MultipartFile file, Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Evento não encontrado!"));
        eventService.checkPermission(eventId, userId);
        String fileName = storeFile(file);
        event.setPhoto(fileName);
        eventRepository.save(event);
        return fileName;
    }

    
    public org.springframework.core.io.Resource loadFileAsResource(String fileName) {
        try {
            java.nio.file.Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Arquivo não encontrado: " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("Arquivo não encontrado: " + fileName, ex);
        }
    }
}
