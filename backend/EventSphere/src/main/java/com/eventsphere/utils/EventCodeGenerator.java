package com.eventsphere.utils;

import java.security.SecureRandom;
import java.util.Set;


public class EventCodeGenerator {
    
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom random = new SecureRandom();
    
    
    public static String generateEventCode(Set<String> existingCodes) {
        String code;
        int attempts = 0;
        int maxAttempts = 100; 
        do {
            code = generateRandomCode();
            attempts++;
            
            if (attempts > maxAttempts) {
                throw new RuntimeException("Não foi possível gerar um código único após " + maxAttempts + " tentativas");
            }
        } while (existingCodes.contains(code));
        return code;
    }
    
    
    public static String generateRandomCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }
        
        return code.toString();
    }
    
    
    public static boolean isValidCodeFormat(String code) {
        if (code == null || code.length() != CODE_LENGTH) {
            return false;
        }
        
        return code.matches("[A-Z0-9]{" + CODE_LENGTH + "}");
    }
    
    
    public static long getTotalCombinations() {
        return (long) Math.pow(CHARACTERS.length(), CODE_LENGTH);
    }
}
