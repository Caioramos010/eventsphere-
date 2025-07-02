package com.eventsphere.service;

import com.eventsphere.entity.event.EventParticipant;
import com.eventsphere.entity.event.ParticipantHistory;
import com.eventsphere.entity.event.ParticipantStatus;
import com.eventsphere.entity.user.User;
import com.eventsphere.repository.ParticipantHistoryRepository;
import com.eventsphere.repository.ParticipantRepository;
import com.eventsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.logging.Logger;

@Service
public class QrCodeService {
    private static final Logger logger = Logger.getLogger(QrCodeService.class.getName());

    @Autowired
    private ParticipantRepository participantRepository;
    
    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParticipantHistoryRepository historyRepository;

    public String createQrCode(Long participantId) {
        try {
            int token = 100000 + new SecureRandom().nextInt(900000);
            String qrCodeText = String.valueOf(token);
            int width = 300;
            int height = 300;
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeText, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (WriterException | IOException e) {
            logger.severe("Erro ao gerar QR Code: " + e.getMessage());
            throw new RuntimeException("Erro ao gerar QR Code", e);
        }
    }

    public boolean processQrCode(String codeOrQr) {
        try {
            processQrCodeInternal(codeOrQr);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void logParticipantHistory(EventParticipant participant, ParticipantStatus status) {
        if (participant == null) {
            throw new IllegalArgumentException("Participante não pode ser nulo ao registrar histórico");
        }
        ParticipantHistory history = new ParticipantHistory();
        history.setParticipant(participant);
        history.setStatus(status);
        history.setChangeTimestamp(LocalDateTime.now());
        historyRepository.save(history);
    }

    public void processQrCodeWithPermission(String codeOrQr, String username) {
        if (codeOrQr == null || codeOrQr.trim().isEmpty()) {
            throw new IllegalArgumentException("Token não pode ser vazio");
        }
        
        String token = codeOrQr.trim();
        
        if (!token.matches("\\d{6}")) {
            throw new IllegalArgumentException("Token deve ser um código de 6 dígitos");
        }
        
        EventParticipant participant = participantRepository.findByQrCode(token);
        if (participant == null) {
            throw new IllegalArgumentException("Token não encontrado ou inválido");
        }
            
        Long eventId = participant.getEvent().getId();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new SecurityException("Usuário não autenticado");
        }
        
        processQrCodeInternal(codeOrQr);
    }
    private void processQrCodeInternal(String codeOrQr) {
        if (codeOrQr == null || codeOrQr.trim().isEmpty()) {
            throw new IllegalArgumentException("QR code não pode ser vazio");
        }
        
        String token = codeOrQr.trim();
        
        if (token.isEmpty()) {
            throw new IllegalArgumentException("Token do QR code não pode ser vazio");
        }
        
        if (!token.matches("\\d{6}")) {
            throw new IllegalArgumentException("Token deve ser um código de 6 dígitos");
        }
        
        EventParticipant participant = participantRepository.findByQrCode(token);
        if (participant == null) {
            throw new IllegalArgumentException("Token não encontrado ou inválido");
        }
        
        if (participant.getCurrentStatus() == ParticipantStatus.PRESENT) {
            throw new IllegalArgumentException("O participante já está presente");
        }
        
        if (participant.getEvent().getState() != com.eventsphere.entity.event.State.ACTIVE) {
            throw new IllegalArgumentException("Só é possível confirmar presença em eventos ativos");
        }
        
        participant.setCurrentStatus(ParticipantStatus.PRESENT);
        participantRepository.save(participant);
        logParticipantHistory(participant, ParticipantStatus.PRESENT);
        
        logger.info("Presença confirmada para participante " + participant.getId() + " com token " + token);
    }

    public String generateQrCodeText(Long participantId) {
        int token = 100000 + new SecureRandom().nextInt(900000);
        return String.valueOf(token);
    }

    public java.util.Map<String, String> createQrCodeComplete(Long participantId) {
        try {
            EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participante não encontrado"));
            // Log do estado do evento para debug
            logger.info("Estado do evento ao gerar QR Code: " + participant.getEvent().getState());
            // Só permite gerar QR code se o evento estiver ACTIVE
            if (participant.getEvent().getState() != com.eventsphere.entity.event.State.ACTIVE) {
                throw new IllegalArgumentException("QR Code só pode ser gerado para eventos ativos");
            }
            // Sempre gera um novo token e sobrescreve o campo qrCode
            String qrCodeText = generateQrCodeText(participantId);
            participant.setQrCode(qrCodeText);
            participantRepository.save(participant);

            int width = 300;
            int height = 300;
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeText, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] imageBytes = outputStream.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            java.util.Map<String, String> result = new java.util.HashMap<>();
            result.put("qrCodeText", qrCodeText);
            result.put("qrCodeImage", base64Image);
            return result;
        } catch (WriterException | IOException e) {
            logger.severe("Erro ao gerar QR Code completo: " + e.getMessage());
            throw new RuntimeException("Erro ao gerar QR Code", e);
        }
    }
}