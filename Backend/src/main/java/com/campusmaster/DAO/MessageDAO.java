package com.campusmaster.DAO;

import com.campusmaster.Entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageDAO extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
    List<Message> findByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.userEmail != :userEmail AND m.isRead = false")
    Long countUnreadInConversation(@Param("conversationId") Long conversationId, @Param("userEmail") String userEmail);

    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "(m.conversation.participant1.userEmail = :userEmail OR m.conversation.participant2.userEmail = :userEmail) " +
           "AND m.sender.userEmail != :userEmail AND m.isRead = false")
    Long countTotalUnread(@Param("userEmail") String userEmail);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.userEmail != :userEmail AND m.isRead = false")
    void markAsReadInConversation(@Param("conversationId") Long conversationId, @Param("userEmail") String userEmail);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC LIMIT 1")
    Optional<Message> findLastMessageByConversationId(@Param("conversationId") Long conversationId);
}
