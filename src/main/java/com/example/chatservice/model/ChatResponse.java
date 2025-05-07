
package com.example.chatservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String text;
    private String sender;
    private LocalDateTime timestamp;
    
    public static ChatResponse createBotResponse(String text) {
        return new ChatResponse(
            text,
            "bot",
            LocalDateTime.now()
        );
    }
}

