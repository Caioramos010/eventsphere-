package com.eventsphere.utils;

import com.eventsphere.entity.user.User;
import com.eventsphere.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    
    @Autowired
    private UserRepository userRepository;

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username);
    }
    

    public boolean isEventOwnerOrCollaborator(Long eventId) {
        User user = getAuthenticatedUser();
        if (user == null) return false;
        
        return true; 
    }
}
