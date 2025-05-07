
package com.example.chatservice.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class ChatService {

    private final Random random = new Random();
    
    private final List<String> mockResponses = Arrays.asList(
        "I'm just a mock AI. In a real implementation, I would connect to an AI service.",
        "That's an interesting question! I'd give a more thoughtful answer if I were a real AI.",
        "Thanks for your message. This is a placeholder response from the mock API.",
        "Hello! I'm your friendly neighborhood mock AI assistant.",
        "I'm not actually thinking about my response. Just returning pre-written text.",
        "In a production environment, I would process your request with a real AI model."
    );

    public String generateResponse(String message) {
        // Simulate processing time
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Return a random mock response
        return mockResponses.get(random.nextInt(mockResponses.size()));
    }
}

