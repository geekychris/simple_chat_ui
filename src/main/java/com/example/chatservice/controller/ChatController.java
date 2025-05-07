
package com.example.chatservice.controller;

import com.example.chatservice.model.ChatRequest;
import com.example.chatservice.model.ChatResponse;
import com.example.chatservice.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/chatjson")
    public String handleChatGet(@RequestParam String message) {
        // For compatibility with existing frontend
        return chatService.generateResponse(message);
    }

    @PostMapping("/chatjson")
    public ChatResponse handleChatPost(@RequestBody ChatRequest request) {
        String response = chatService.generateResponse(request.getMessage());
        return ChatResponse.createBotResponse(response);
    }
}

