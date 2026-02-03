package com.campusmaster.Service;

import com.campusmaster.DAO.CourseDAO;
import com.campusmaster.DAO.CourseEnrollmentDAO;
import com.campusmaster.DAO.ForumPostDAO;
import com.campusmaster.DAO.ForumReplyDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Course;
import com.campusmaster.Entity.ForumPost;
import com.campusmaster.Entity.ForumReply;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ForumService {

    @Autowired
    private ForumPostDAO forumPostDAO;

    @Autowired
    private ForumReplyDAO forumReplyDAO;

    @Autowired
    private CourseDAO courseDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private CourseEnrollmentDAO courseEnrollmentDAO;

    // Check if user has access to course forum (teacher or enrolled student)
    private boolean hasAccessToCourse(Long courseId, String userEmail) {
        Course course = courseDAO.findById(courseId).orElse(null);
        if (course == null) return false;

        // Teacher has access
        if (course.getTeacher().getUserEmail().equals(userEmail)) {
            return true;
        }

        // Check if student is enrolled
        return courseEnrollmentDAO.existsByCourseIdAndStudentUserEmail(courseId, userEmail);
    }

    // ==================== Forum Posts ====================

    public List<ForumPost> getPostsByCourse(Long courseId, String userEmail) {
        if (!hasAccessToCourse(courseId, userEmail)) {
            throw new RuntimeException("You don't have access to this course forum");
        }
        return forumPostDAO.findByCourseId(courseId);
    }

    public Optional<ForumPost> getPostById(Long postId, String userEmail) {
        Optional<ForumPost> post = forumPostDAO.findById(postId);
        if (post.isPresent()) {
            if (!hasAccessToCourse(post.get().getCourse().getId(), userEmail)) {
                throw new RuntimeException("You don't have access to this post");
            }
        }
        return post;
    }

    public ForumPost createPost(Long courseId, String title, String content, String authorEmail) {
        if (!hasAccessToCourse(courseId, authorEmail)) {
            throw new RuntimeException("You don't have access to this course forum");
        }

        Course course = courseDAO.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        User author = userDAO.findByUserEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + authorEmail));

        ForumPost post = new ForumPost();
        post.setCourse(course);
        post.setAuthor(author);
        post.setTitle(title);
        post.setContent(content);

        return forumPostDAO.save(post);
    }

    public ForumPost updatePost(Long postId, String title, String content, String userEmail) {
        ForumPost post = forumPostDAO.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // Only author or course teacher can edit
        boolean isAuthor = post.getAuthor().getUserEmail().equals(userEmail);
        boolean isTeacher = post.getCourse().getTeacher().getUserEmail().equals(userEmail);

        if (!isAuthor && !isTeacher) {
            throw new RuntimeException("You are not authorized to edit this post");
        }

        if (title != null) {
            post.setTitle(title);
        }
        if (content != null) {
            post.setContent(content);
        }

        return forumPostDAO.save(post);
    }

    @Transactional
    public void deletePost(Long postId, String userEmail) {
        ForumPost post = forumPostDAO.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // Only author or course teacher can delete
        boolean isAuthor = post.getAuthor().getUserEmail().equals(userEmail);
        boolean isTeacher = post.getCourse().getTeacher().getUserEmail().equals(userEmail);

        if (!isAuthor && !isTeacher) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        forumPostDAO.delete(post);
    }

    // Pin/Unpin post (teacher only)
    public ForumPost togglePinPost(Long postId, String userEmail) {
        ForumPost post = forumPostDAO.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // Only course teacher can pin/unpin
        if (!post.getCourse().getTeacher().getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Only the course teacher can pin/unpin posts");
        }

        post.setIsPinned(!post.getIsPinned());
        return forumPostDAO.save(post);
    }

    // Close/Open post (teacher only)
    public ForumPost toggleClosePost(Long postId, String userEmail) {
        ForumPost post = forumPostDAO.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // Only course teacher can close/open
        if (!post.getCourse().getTeacher().getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Only the course teacher can close/open posts");
        }

        post.setIsClosed(!post.getIsClosed());
        return forumPostDAO.save(post);
    }

    public List<ForumPost> searchPosts(Long courseId, String search, String userEmail) {
        if (!hasAccessToCourse(courseId, userEmail)) {
            throw new RuntimeException("You don't have access to this course forum");
        }
        return forumPostDAO.searchInCourse(courseId, search);
    }

    // ==================== Forum Replies ====================

    public List<ForumReply> getRepliesByPost(Long postId, String userEmail) {
        ForumPost post = forumPostDAO.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        if (!hasAccessToCourse(post.getCourse().getId(), userEmail)) {
            throw new RuntimeException("You don't have access to this post");
        }

        return forumReplyDAO.findByPostId(postId);
    }

    public ForumReply createReply(Long postId, String content, String authorEmail) {
        ForumPost post = forumPostDAO.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        if (!hasAccessToCourse(post.getCourse().getId(), authorEmail)) {
            throw new RuntimeException("You don't have access to reply to this post");
        }

        if (post.getIsClosed()) {
            throw new RuntimeException("This post is closed and no longer accepts replies");
        }

        User author = userDAO.findByUserEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + authorEmail));

        ForumReply reply = new ForumReply();
        reply.setForumPost(post);
        reply.setAuthor(author);
        reply.setContent(content);

        return forumReplyDAO.save(reply);
    }

    public ForumReply updateReply(Long replyId, String content, String userEmail) {
        ForumReply reply = forumReplyDAO.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found with id: " + replyId));

        // Only author can edit their reply
        if (!reply.getAuthor().getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to edit this reply");
        }

        reply.setContent(content);
        return forumReplyDAO.save(reply);
    }

    public void deleteReply(Long replyId, String userEmail) {
        ForumReply reply = forumReplyDAO.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found with id: " + replyId));

        // Author or course teacher can delete
        boolean isAuthor = reply.getAuthor().getUserEmail().equals(userEmail);
        boolean isTeacher = reply.getForumPost().getCourse().getTeacher().getUserEmail().equals(userEmail);

        if (!isAuthor && !isTeacher) {
            throw new RuntimeException("You are not authorized to delete this reply");
        }

        forumReplyDAO.delete(reply);
    }

    // ==================== Statistics ====================

    public Long getPostCountByCourse(Long courseId) {
        return forumPostDAO.countByCourseId(courseId);
    }

    public Long getReplyCountByPost(Long postId) {
        return forumReplyDAO.countByPostId(postId);
    }
}
