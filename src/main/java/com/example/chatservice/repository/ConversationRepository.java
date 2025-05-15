package com.example.chatservice.repository;

import com.example.chatservice.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUserId(Long userId);
    List<Conversation> findByUserIdOrderByUpdatedAtDesc(Long userId);
}

