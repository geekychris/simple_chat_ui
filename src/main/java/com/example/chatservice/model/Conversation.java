package com.example.chatservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@EqualsAndHashCode(exclude = {"user"})
@ToString(exclude = {"user"})
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(Conversation.class);
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "messages", columnDefinition = "TEXT")
    private String messagesJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    private List<ChatResponse> messages;

    public List<ChatResponse> getMessages() {
        if (messages == null) {
            try {
                if (messagesJson != null && !messagesJson.isEmpty()) {
                    messages = objectMapper.readValue(messagesJson, new TypeReference<List<ChatResponse>>() {});
                    logger.debug("Deserialized messages: {}", messages);
                } else {
                    messages = new ArrayList<>();
                }
            } catch (JsonProcessingException e) {
                messages = new ArrayList<>();
            }
        }
        return messages;
    }

    public void setMessages(List<ChatResponse> messages) {
        this.messages = messages;
        try {
            this.messagesJson = objectMapper.writeValueAsString(messages);
            logger.debug("Serialized messages to JSON: {}", this.messagesJson);
        } catch (JsonProcessingException e) {
            this.messagesJson = "[]";
        }
    }

    public void addMessage(ChatResponse message) {
        List<ChatResponse> currentMessages = new ArrayList<>();
        try {
            if (messagesJson != null && !messagesJson.isEmpty()) {
                currentMessages = objectMapper.readValue(messagesJson, new TypeReference<List<ChatResponse>>() {});
            }
        } catch (JsonProcessingException e) {
            logger.error("Error deserializing messagesJson", e);
        }
        currentMessages.add(message);
        try {
            this.messagesJson = objectMapper.writeValueAsString(currentMessages);
            logger.debug("Serialized messages to JSON: {}", this.messagesJson);
        } catch (JsonProcessingException e) {
            logger.error("Error serializing messages", e);
            this.messagesJson = "[]";
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
