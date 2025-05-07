package com.example.chatservice.service;

import com.example.chatservice.model.ChatRequest;
import com.example.chatservice.model.ChatResponse;
import com.example.chatservice.model.FileInfo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class ChatService {
    private final Random random = new Random();
    
    private final List<String> mockResponses = Arrays.asList(
        // Basic response with bold and italic text
        "I'm just a **mock AI**. In a *real implementation*, I would connect to an AI service.",
        
        // Response with headings and lists
        "# Here's Some Information\n\n" +
        "That's an interesting question! Here are some key points:\n\n" +
        "* Point one about the topic\n" +
        "* Point two with some detail\n" +
        "* Point three with **important** information\n\n" +
        "## Further Reading\n" +
        "You might want to explore these subtopics as well.",
        
        // Response with code blocks
        "Here's how you would implement this in Java:\n\n" +
        "```java\n" +
        "public class Example {\n" +
        "    public static void main(String[] args) {\n" +
        "        System.out.println(\"Hello, World!\");\n" +
        "    }\n" +
        "}\n" +
        "```\n\n" +
        "You can also use inline code like `String message = \"Hello\";`",
        
        // Response with tables
        "Here's a comparison of different approaches:\n\n" +
        "| Feature | Approach A | Approach B | Approach C |\n" +
        "|---------|------------|------------|------------|\n" +
        "| Speed   | Fast       | Medium     | Slow       |\n" +
        "| Memory  | High       | Low        | Medium     |\n" +
        "| Cost    | Expensive  | Cheap      | Moderate   |\n\n" +
        "Choose the approach that best fits your requirements.",
        
        // Response with links and blockquotes
        "You might find this resource helpful: [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/).\n\n" +
        "> Important note: Always refer to the official documentation for the most up-to-date information.\n\n" +
        "Remember to check for the latest version on [GitHub](https://github.com/spring-projects/spring-boot).",
        
        // Response with mixed elements
        "# Analysis of Your Question\n\n" +
        "Your question touches on several important aspects:\n\n" +
        "1. **Primary considerations**\n" +
        "   - Technical feasibility\n" +
        "   - Cost implications\n" +
        "   - Timeline constraints\n\n" +
        "2. **Implementation options**\n\n" +
        "```python\n" +
        "def example_function():\n" +
        "    return \"This is just an example\"\n" +
        "```\n\n" +
        "> Remember that the best solution depends on your specific context.\n\n" +
        "For more information, visit [our documentation](https://example.com)."
    );
    
    public ChatResponse processMessage(ChatRequest request) {
        // Simulate processing time
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        StringBuilder responseText = new StringBuilder();
        
        // Get a random mock response
        String mockResponse = mockResponses.get(random.nextInt(mockResponses.size()));
        responseText.append(mockResponse).append("\n\n");
        
        // Add information about the user's message
        responseText.append("---\n\n")
                   .append("Your message was:\n\n```\n")
                   .append(request.getMessage())
                   .append("\n```\n\n");
        
        // If there's a file, add information about it
        if (request.getFileInfo() != null) {
            FileInfo fileInfo = request.getFileInfo();
            responseText.append("I also received your file:\n\n")
                       .append("| Property | Value |\n")
                       .append("|----------|-------|\n")
                       .append("| Name | `").append(fileInfo.getOriginalFileName()).append("` |\n")
                       .append("| Type | `").append(fileInfo.getFileType()).append("` |\n")
                       .append("| Size | `").append(formatFileSize(fileInfo.getSize())).append("` |\n");
            
            return ChatResponse.createBotResponseWithFile(responseText.toString(), request.getFileInfo());
        }
        
        return ChatResponse.createBotResponse(responseText.toString());
    }
    
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }
}

