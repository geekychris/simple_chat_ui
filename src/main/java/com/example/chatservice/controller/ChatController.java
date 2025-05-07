package com.example.chatservice.controller;

import com.example.chatservice.model.ChatRequest;
import com.example.chatservice.model.ChatResponse;
import com.example.chatservice.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping(value = "/message", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ChatResponse> handleChatMessage(@RequestBody ChatRequest request) {
        logger.info("Received chat message: {}", request.getMessage());
        
        try {
            ChatResponse response = chatService.processMessage(request);
            logger.info("Processed chat message successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing chat message", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/message", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ChatResponse> handleChatGet(@RequestParam String message) {
        logger.info("Received GET chat message: {}", message);
        
        try {
            ChatRequest request = new ChatRequest();
            request.setMessage(message);
            ChatResponse response = chatService.processMessage(request);
            logger.info("Processed GET chat message successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing GET chat message", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chat service is running");
    }
}
