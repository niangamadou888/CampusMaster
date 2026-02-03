package com.campusmaster.DAO;

import com.campusmaster.Entity.Notification;
import com.campusmaster.Entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationDAO extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.recipient.userEmail = :email ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientEmail(@Param("email") String email);

    @Query("SELECT n FROM Notification n WHERE n.recipient.userEmail = :email AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByRecipientEmail(@Param("email") String email);

    @Query("SELECT n FROM Notification n WHERE n.recipient.userEmail = :email AND n.isRead = true ORDER BY n.createdAt DESC")
    List<Notification> findReadByRecipientEmail(@Param("email") String email);

    @Query("SELECT n FROM Notification n WHERE n.recipient.userEmail = :email AND n.notificationType = :type ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientEmailAndType(@Param("email") String email, @Param("type") NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.userEmail = :email AND n.isRead = false")
    Long countUnreadByRecipientEmail(@Param("email") String email);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.userEmail = :email")
    void markAllAsReadByRecipientEmail(@Param("email") String email);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsRead(@Param("id") Long id);

    @Query("SELECT n FROM Notification n WHERE n.relatedEntityType = :entityType AND n.relatedEntityId = :entityId")
    List<Notification> findByRelatedEntity(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    void deleteByRecipientUserEmail(String email);
}
