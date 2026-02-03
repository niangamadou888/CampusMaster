package com.campusmaster.DAO;

import com.campusmaster.Entity.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumPostDAO extends JpaRepository<ForumPost, Long> {

    @Query("SELECT DISTINCT p FROM ForumPost p LEFT JOIN FETCH p.replies WHERE p.course.id = :courseId ORDER BY p.isPinned DESC, p.createdAt DESC")
    List<ForumPost> findByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT p FROM ForumPost p WHERE p.author.userEmail = :email ORDER BY p.createdAt DESC")
    List<ForumPost> findByAuthorEmail(@Param("email") String email);

    @Query("SELECT p FROM ForumPost p WHERE p.course.id = :courseId AND p.isPinned = TRUE ORDER BY p.createdAt DESC")
    List<ForumPost> findPinnedByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT COUNT(p) FROM ForumPost p WHERE p.course.id = :courseId")
    Long countByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT DISTINCT p FROM ForumPost p LEFT JOIN FETCH p.replies WHERE p.course.id = :courseId AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY p.isPinned DESC, p.createdAt DESC")
    List<ForumPost> searchInCourse(@Param("courseId") Long courseId, @Param("search") String search);
}
