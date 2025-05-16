package com.example.chatservice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String message;
    private String sender;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private LocalDateTime timestamp;
    
    private FileInfo fileInfo;
    
    private Long conversationId;
    
    public ChatResponse(String message, String sender, LocalDateTime timestamp) {
        this.message = message;
        this.sender = sender;
        this.timestamp = timestamp;
    }
    
    public ChatResponse(String message, String sender, LocalDateTime timestamp, Long conversationId) {
        this.message = message;
        this.sender = sender;
        this.timestamp = timestamp;
        this.conversationId = conversationId;
    }
    
    public static ChatResponse createBotResponse(String message) {
        return new ChatResponse(
            message,
            "bot",
            LocalDateTime.now()
        );
    }
    
    public static ChatResponse createBotResponseWithFile(String message, FileInfo fileInfo) {
        ChatResponse response = new ChatResponse(
            message,
            "bot",
            LocalDateTime.now()
        );
        response.setFileInfo(fileInfo);
        return response;
    }
    
    public static ChatResponse createBotResponseWithConversation(String message, Long conversationId) {
        return new ChatResponse(
            message,
            "bot",
            LocalDateTime.now(),
            conversationId
        );
    }
    
    public static ChatResponse createUserResponse(String message, Long conversationId) {
        return new ChatResponse(
            message,
            "user",
            LocalDateTime.now(),
            conversationId
        );
    }

    @JsonIgnore
    public String getFormattedTimestamp() {
        if (timestamp == null) {
            return null;
        }
        return timestamp.atZone(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}
