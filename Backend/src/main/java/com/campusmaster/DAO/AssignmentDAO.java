package com.campusmaster.DAO;

import com.campusmaster.Entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentDAO extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByCourseIdAndIsPublishedTrue(Long courseId);

    @Query("SELECT a FROM Assignment a WHERE a.teacher.userEmail = :teacherEmail")
    List<Assignment> findByTeacherEmail(@Param("teacherEmail") String teacherEmail);

    @Query("SELECT a FROM Assignment a WHERE a.course.id = :courseId AND a.isPublished = true ORDER BY a.deadline ASC")
    List<Assignment> findPublishedByCourseOrderByDeadline(@Param("courseId") Long courseId);

    @Query("SELECT a FROM Assignment a WHERE a.deadline > :now AND a.isPublished = true ORDER BY a.deadline ASC")
    List<Assignment> findUpcomingAssignments(@Param("now") LocalDateTime now);

    @Query("SELECT a FROM Assignment a JOIN a.course c JOIN c.enrollments e WHERE e.student.userEmail = :studentEmail AND a.isPublished = true ORDER BY a.deadline ASC")
    List<Assignment> findAssignmentsForStudent(@Param("studentEmail") String studentEmail);

    @Query("SELECT a FROM Assignment a JOIN a.course c JOIN c.enrollments e WHERE e.student.userEmail = :studentEmail AND a.deadline > :now AND a.isPublished = true ORDER BY a.deadline ASC")
    List<Assignment> findUpcomingAssignmentsForStudent(@Param("studentEmail") String studentEmail, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.course.id = :courseId AND a.isPublished = true")
    Long countPublishedByCourse(@Param("courseId") Long courseId);
}
