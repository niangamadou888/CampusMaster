package com.campusmaster.Controller;

import com.campusmaster.Entity.Conversation;
import com.campusmaster.Entity.Message;
import com.campusmaster.Entity.User;
import com.campusmaster.Service.MessageService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Conversation>> getConversations(@RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(messageService.getConversations(userEmail));
    }

    @GetMapping("/conversations/{id}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            return ResponseEntity.ok(messageService.getMessages(id, userEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/send")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            String senderEmail = extractEmailFromToken(token);
            String recipientEmail = request.get("recipientEmail");
            String content = request.get("content");

            if (recipientEmail == null || recipientEmail.isBlank()) {
                return ResponseEntity.badRequest().body("Recipient email is required");
            }
            if (content == null || content.isBlank()) {
                return ResponseEntity.badRequest().body("Message content is required");
            }

            Message message = messageService.sendMessage(senderEmail, recipientEmail, content);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/conversations/{id}/read")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            messageService.markAsRead(id, userEmail);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        Map<String, Long> response = new HashMap<>();
        response.put("count", messageService.getUnreadCount(userEmail));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/contacts")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<User>> getContacts(@RequestHeader("Authorization") String token) {
        String userEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(messageService.getContacts(userEmail));
    }
}
