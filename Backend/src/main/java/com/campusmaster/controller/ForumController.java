package com.campusmaster.Controller;

import com.campusmaster.Entity.ForumPost;
import com.campusmaster.Entity.ForumReply;
import com.campusmaster.Service.ForumService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    @Autowired
    private ForumService forumService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    // ==================== Forum Posts ====================

    @GetMapping("/course/{courseId}/posts")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<ForumPost>> getPostsByCourse(
            @PathVariable Long courseId,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            return ResponseEntity.ok(forumService.getPostsByCourse(courseId, userEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/posts/{postId}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<ForumPost> getPostById(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            return forumService.getPostById(postId, userEmail)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/course/{courseId}/posts")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<ForumPost> createPost(
            @PathVariable Long courseId,
            @RequestBody CreatePostRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            ForumPost post = forumService.createPost(courseId, request.getTitle(), request.getContent(), userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/posts/{postId}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<ForumPost> updatePost(
            @PathVariable Long postId,
            @RequestBody UpdatePostRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            ForumPost updated = forumService.updatePost(postId, request.getTitle(), request.getContent(), userEmail);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            forumService.deletePost(postId, userEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/posts/{postId}/pin")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<ForumPost> togglePinPost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            ForumPost post = forumService.togglePinPost(postId, userEmail);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/posts/{postId}/close")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<ForumPost> toggleClosePost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            ForumPost post = forumService.toggleClosePost(postId, userEmail);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/course/{courseId}/posts/search")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<ForumPost>> searchPosts(
            @PathVariable Long courseId,
            @RequestParam String q,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            return ResponseEntity.ok(forumService.searchPosts(courseId, q, userEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    // ==================== Forum Replies ====================

    @GetMapping("/posts/{postId}/replies")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<ForumReply>> getRepliesByPost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            return ResponseEntity.ok(forumService.getRepliesByPost(postId, userEmail));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/posts/{postId}/replies")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<ForumReply> createReply(
            @PathVariable Long postId,
            @RequestBody CreateReplyRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            ForumReply reply = forumService.createReply(postId, request.getContent(), userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(reply);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/replies/{replyId}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<ForumReply> updateReply(
            @PathVariable Long replyId,
            @RequestBody CreateReplyRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            ForumReply updated = forumService.updateReply(replyId, request.getContent(), userEmail);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/replies/{replyId}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long replyId,
            @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractEmailFromToken(token);
            forumService.deleteReply(replyId, userEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== Request DTOs ====================

    public static class CreatePostRequest {
        private String title;
        private String content;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    public static class UpdatePostRequest {
        private String title;
        private String content;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    public static class CreateReplyRequest {
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
