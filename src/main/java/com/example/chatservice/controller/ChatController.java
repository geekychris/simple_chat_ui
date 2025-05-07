package com.example.chatservice.controller;

import com.example.chatservice.model.ChatRequest;
import com.example.chatservice.model.ChatResponse;
import com.example.chatservice.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping(value = "/chatjson", produces = MediaType.APPLICATION_JSON_VALUE)
    public ChatResponse handleChatGet(@RequestParam String message) {
        return chatService.generateResponse(message);
    }

    @PostMapping(value = "/chatjson", produces = MediaType.APPLICATION_JSON_VALUE)
    public ChatResponse handleChatPost(@RequestBody ChatRequest request) {
        return chatService.generateResponse(request.getMessage());
    }
}
