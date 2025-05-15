package com.example.chatservice.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private Long userId;

    public static AuthResponse of(String token, String username, Long userId) {
        return new AuthResponse(token, username, userId);
    }
}
