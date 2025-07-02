package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import com.eventsphere.service.QrCodeService;
import com.eventsphere.utils.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qrcode")
public class QrCodeController {

    @Autowired
    private QrCodeService qrCodeService;
    
    @Autowired
    private SecurityUtils securityUtils;

    @PostMapping("/scan")
    public ApiResponse<?> scanQrCode(@RequestParam String token) {
        String username = securityUtils.getAuthenticatedUser().getUsername();
        qrCodeService.processQrCodeWithPermission(token, username);
        return ApiResponse.success("Presença confirmada com sucesso", null);
    }
}