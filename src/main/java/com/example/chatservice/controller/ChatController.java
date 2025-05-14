package com.example.chatservice.controller;

import com.example.chatservice.model.ChatRequest;
import com.example.chatservice.model.ChatResponse;
import com.example.chatservice.service.ChatService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;


    private final EmbeddingModel embeddingModel;

    private final ChatClient chatClient;

    private final ChatClient vectorChatClient;


    public ChatController(ChatService chatService, EmbeddingModel embeddingModel, ChatClient.Builder chatBuilder, @Value("classpath:milton.pdf") Resource pdf) {
        this.chatService = chatService;
        this.embeddingModel = embeddingModel;

        SimpleVectorStore vectorStore =  SimpleVectorStore.builder(embeddingModel).build();;
        //vectorStore.add(new TokenTextSplitter().split(new PagePdfDocumentReader(pdf).read()));

        this.chatClient = chatBuilder
                .defaultSystem("You are useful assistant, expert in hurricanes.") // Set the system prompt
                .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory())) // Enable chat memory
                //.defaultAdvisors(new QuestionAnswerAdvisor(vectorStore)) // Enable RAG
                .build();

        this.vectorChatClient = chatBuilder
                .defaultSystem("You are useful assistant, expert in hurricanes.") // Set the system prompt
                .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory())) // Enable chat memory
                .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore)) // Enable RAG
                .build();
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
           // String  result = chatClient.prompt(request.getMessage()).tools(new MyTools()).call().content();
            String  result = chatClient.prompt(request.getMessage()).call().content();

            //String res =  chatClient.prompt(prompt).call().content();
            //return "{ \"key\": \"" +result + "\"";
            //ChatResponse response = chatService.processMessage(request);
            ChatResponse response = new ChatResponse(
                    result,
                    "bot",
                    LocalDateTime.now()
            );
            logger.info("Processed chat message successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing chat message", e);
            return ResponseEntity.internalServerError().build();
        }
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
}
