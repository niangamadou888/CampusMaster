package com.campusmaster.DAO;

import com.campusmaster.Entity.ForumReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumReplyDAO extends JpaRepository<ForumReply, Long> {

    @Query("SELECT r FROM ForumReply r WHERE r.forumPost.id = :postId ORDER BY r.createdAt ASC")
    List<ForumReply> findByPostId(@Param("postId") Long postId);

    @Query("SELECT r FROM ForumReply r WHERE r.author.userEmail = :email ORDER BY r.createdAt DESC")
    List<ForumReply> findByAuthorEmail(@Param("email") String email);

    @Query("SELECT COUNT(r) FROM ForumReply r WHERE r.forumPost.id = :postId")
    Long countByPostId(@Param("postId") Long postId);

    void deleteByForumPostId(Long postId);
}
