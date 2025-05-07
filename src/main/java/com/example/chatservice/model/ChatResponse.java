package com.example.chatservice.model;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String text;
    private String sender;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private LocalDateTime timestamp;
    
    private FileInfo fileInfo;
    
    public ChatResponse(String text, String sender, LocalDateTime timestamp) {
        this.text = text;
        this.sender = sender;
        this.timestamp = timestamp;
    }
    
    public static ChatResponse createBotResponse(String text) {
        return new ChatResponse(
            text,
            "bot",
            LocalDateTime.now()
        );
    }
    
    public static ChatResponse createBotResponseWithFile(String text, FileInfo fileInfo) {
        ChatResponse response = new ChatResponse(
            text,
            "bot",
            LocalDateTime.now()
        );
        response.setFileInfo(fileInfo);
        return response;
    }
    
    // Add method to get ISO-8601 formatted timestamp for frontend
    public String getFormattedTimestamp() {
        if (timestamp == null) {
            return null;
        }
        return timestamp.atZone(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}
