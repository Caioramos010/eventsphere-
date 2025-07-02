package com.eventsphere.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Arrays;
import java.util.List;

@Service
public class ImageService {
    
    private static final List<String> ALLOWED_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    public String convertToBase64(MultipartFile file) {

        validateImageFile(file);
        
        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String mimeType = file.getContentType();
            return String.format("data:%s;base64,%s", mimeType, base64);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar arquivo de imagem", e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem é obrigatório");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Arquivo muito grande. Tamanho máximo: 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Formatos aceitos: JPEG, PNG, GIF, WebP");
        }
    }

    public String extractBase64(String dataUrl) {
        if (dataUrl == null || !dataUrl.contains(",")) {
            return dataUrl;
        }
        return dataUrl.substring(dataUrl.indexOf(",") + 1);
    }

    public String addDataPrefix(String base64, String mimeType) {
        if (base64 == null || base64.startsWith("data:")) {
            return base64;
        }
        if (mimeType == null) {
            mimeType = "image/jpeg";
        }
        return String.format("data:%s;base64,%s", mimeType, base64);
    }
}
