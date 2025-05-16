package com.example.chatservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private FileInfo fileInfo;
    private Long conversationId;
    
    public ChatRequest(String message) {
        this.message = message;
    }
    
    public ChatRequest(String message, FileInfo fileInfo) {
        this.message = message;
        this.fileInfo = fileInfo;
    }
}
