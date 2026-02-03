package com.campusmaster.DAO;

import com.campusmaster.Entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationDAO extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.participant1.userEmail = :email OR c.participant2.userEmail = :email ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByParticipantEmail(@Param("email") String email);

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participant1.userEmail = :email1 AND c.participant2.userEmail = :email2) OR " +
           "(c.participant1.userEmail = :email2 AND c.participant2.userEmail = :email1)")
    Optional<Conversation> findByParticipants(@Param("email1") String email1, @Param("email2") String email2);
}
