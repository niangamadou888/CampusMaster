package com.campusmaster.DAO;

import com.campusmaster.Entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeDAO extends JpaRepository<Grade, Long> {
    Optional<Grade> findBySubmissionId(Long submissionId);

    @Query("SELECT g FROM Grade g WHERE g.submission.student.userEmail = :studentEmail ORDER BY g.gradedAt DESC")
    List<Grade> findByStudentEmail(@Param("studentEmail") String studentEmail);

    @Query("SELECT g FROM Grade g WHERE g.submission.assignment.course.id = :courseId")
    List<Grade> findByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT g FROM Grade g WHERE g.submission.assignment.id = :assignmentId")
    List<Grade> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT g FROM Grade g WHERE g.gradedBy.userEmail = :teacherEmail ORDER BY g.gradedAt DESC")
    List<Grade> findByTeacherEmail(@Param("teacherEmail") String teacherEmail);

    @Query("SELECT AVG(g.score) FROM Grade g WHERE g.submission.assignment.id = :assignmentId")
    Double getAverageScoreByAssignment(@Param("assignmentId") Long assignmentId);

    @Query("SELECT AVG(g.score) FROM Grade g WHERE g.submission.assignment.course.id = :courseId")
    Double getAverageScoreByCourse(@Param("courseId") Long courseId);

    @Query("SELECT AVG(g.score) FROM Grade g WHERE g.submission.student.userEmail = :studentEmail")
    Double getAverageScoreByStudent(@Param("studentEmail") String studentEmail);

    @Query("SELECT g FROM Grade g WHERE g.submission.student.userEmail = :studentEmail AND g.submission.assignment.course.id = :courseId ORDER BY g.gradedAt DESC")
    List<Grade> findByStudentAndCourse(@Param("studentEmail") String studentEmail, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(g) FROM Grade g WHERE g.submission.assignment.id = :assignmentId")
    Long countGradedSubmissions(@Param("assignmentId") Long assignmentId);
}
