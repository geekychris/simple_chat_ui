package com.example.chatservice.controller;

import com.example.chatservice.model.ChatRequest;
import com.example.chatservice.model.ChatResponse;
import com.example.chatservice.model.Conversation;
import com.example.chatservice.model.User;
import com.example.chatservice.repository.ConversationRepository;
import com.example.chatservice.repository.UserRepository;
import com.example.chatservice.service.ChatService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final EmbeddingModel embeddingModel;
    private final ChatClient chatClient;
    private final ChatClient vectorChatClient;

    public ChatController(
            ChatService chatService, 
            UserRepository userRepository,
            ConversationRepository conversationRepository,
            EmbeddingModel embeddingModel, 
            ChatClient.Builder chatBuilder, 
            @Value("classpath:milton.pdf") Resource pdf) {
            
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.embeddingModel = embeddingModel;

        SimpleVectorStore vectorStore = SimpleVectorStore.builder(embeddingModel).build();
        //vectorStore.add(new TokenTextSplitter().split(new PagePdfDocumentReader(pdf).read()));

        this.chatClient = chatBuilder
                .defaultSystem("You are a friendly robot named Morbius.") // Set the system prompt
                .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory())) // Enable chat memory
                //.defaultAdvisors(new QuestionAnswerAdvisor(vectorStore)) // Enable RAG
                .build();

        this.vectorChatClient = chatBuilder
                .defaultSystem("You are useful assistant, expert in hurricanes.") // Set the system prompt
                .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory())) // Enable chat memory
                .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore)) // Enable RAG
                .build();
    }
    
    /**
     * Helper method to get the current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }

    @PostMapping(value = "/message_orig", produces = MediaType.APPLICATION_JSON_VALUE)
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

    @PostMapping(value = "/message", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ChatResponse> handleChatMessageAi(@RequestBody ChatRequest request) {
        logger.info("Received chat message: {}", request.getMessage());

        try {
            // Get current user
            User user = getCurrentUser();
            
            // Get active conversation or create a new one if conversationId not provided
            Conversation conversation;
            if (request.getConversationId() != null) {
                conversation = conversationRepository.findById(request.getConversationId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
                
                // Verify the conversation belongs to the current user
                if (!conversation.getUser().getId().equals(user.getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
                }
            } else {
                // Create a new conversation
                conversation = new Conversation();
                conversation.setTitle(generateTitle(request.getMessage()));
                conversation.setUser(user);
                conversation = conversationRepository.save(conversation);
            }
            
            // Add user message to conversation
            ChatResponse userMessage = new ChatResponse(
                    request.getMessage(),
                    "user",
                    LocalDateTime.now()
            );
            conversation.addMessage(userMessage);
            
            // Process the message using AI
            logger.debug("Sending message to AI: {}", request.getMessage());
            String result;
            try {
                result = chatClient.prompt(request.getMessage()).call().content();
                logger.debug("Received AI response: {}", result);
            } catch (Exception e) {
                logger.error("Error getting AI response: ", e);
                throw e;
            }
            
            // Create bot response
            ChatResponse botResponse = new ChatResponse(
                    result,
                    "bot",
                    LocalDateTime.now()
            );
            
            // Add bot response to conversation
            conversation.addMessage(botResponse);
            
            // Save the updated conversation
            conversationRepository.save(conversation);
            
            // Add conversation ID to response for frontend reference
            botResponse.setConversationId(conversation.getId());
            
            logger.info("Processed chat message successfully");
            return ResponseEntity.ok(botResponse);
        } catch (ResponseStatusException e) {
            // Rethrow response status exceptions
            throw e;
        } catch (Exception e) {
            logger.error("Error processing chat message", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private String generateTitle(String message) {
        // Generate a title based on the first message (truncated if necessary)
        return message.length() <= 30 ? message : message.substring(0, 27) + "...";
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
    
    /**
     * Create a new conversation
     */
    @PostMapping("/conversations")
    public ResponseEntity<Conversation> createConversation(@RequestBody Map<String, String> request) {
        User user = getCurrentUser();
        
        Conversation conversation = new Conversation();
        conversation.setTitle(request.getOrDefault("title", "New Conversation"));
        conversation.setUser(user);
        
        Conversation savedConversation = conversationRepository.save(conversation);
        return ResponseEntity.ok(savedConversation);
    }
    
    /**
     * Get all conversations for the current user
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> getConversations() {
        User user = getCurrentUser();
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
        return ResponseEntity.ok(conversations);
    }
    
    /**
     * Get a specific conversation by ID
     */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<Conversation> getConversation(@PathVariable Long id) {
        User user = getCurrentUser();
        
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        
        // Check if conversation belongs to the current user
        if (!conversation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }
        
        return ResponseEntity.ok(conversation);
    }
    
    /**
     * Delete a conversation
     */
    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        User user = getCurrentUser();
        
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));
        
        // Check if conversation belongs to the current user
        if (!conversation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }
        
        conversationRepository.delete(conversation);
        return ResponseEntity.noContent().build();
    }
}
