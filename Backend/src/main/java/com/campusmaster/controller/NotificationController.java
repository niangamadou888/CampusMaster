package com.campusmaster.Controller;

import com.campusmaster.Entity.Notification;
import com.campusmaster.Service.NotificationService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    @GetMapping
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Notification>> getMyNotifications(@RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userEmail));
    }

    @GetMapping("/unread")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userEmail));
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationService.getUnreadCount(userEmail));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Notification> getNotificationById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        return notificationService.getNotificationById(id)
                .filter(n -> n.getRecipient().getUserEmail().equals(userEmail))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            notificationService.markAsRead(id, userEmail);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        notificationService.markAllAsRead(userEmail);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            notificationService.deleteNotification(id, userEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
