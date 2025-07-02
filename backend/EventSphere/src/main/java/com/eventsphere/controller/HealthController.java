package com.eventsphere.controller;

import com.eventsphere.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("message", "EventSphere Backend is running");
        health.put("version", "1.0.0");
        return ApiResponse.success("Backend is healthy", health);
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return response;
    }

    @RequestMapping(value = "/test", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
    public Map<String, Object> test(@RequestHeader Map<String, String> headers) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Test endpoint working");
        response.put("method", "Multiple methods supported");
        response.put("cors", "CORS enabled");
        response.put("headers_received", headers.size());
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}
