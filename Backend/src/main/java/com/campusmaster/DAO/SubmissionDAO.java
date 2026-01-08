package com.campusmaster.DAO;

import com.campusmaster.Entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionDAO extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);

    @Query("SELECT s FROM Submission s WHERE s.student.userEmail = :studentEmail")
    List<Submission> findByStudentEmail(@Param("studentEmail") String studentEmail);

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.student.userEmail = :studentEmail ORDER BY s.version DESC")
    List<Submission> findByAssignmentIdAndStudentEmail(@Param("assignmentId") Long assignmentId, @Param("studentEmail") String studentEmail);

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.student.userEmail = :studentEmail ORDER BY s.version DESC LIMIT 1")
    Optional<Submission> findLatestByAssignmentIdAndStudentEmail(@Param("assignmentId") Long assignmentId, @Param("studentEmail") String studentEmail);

    @Query("SELECT MAX(s.version) FROM Submission s WHERE s.assignment.id = :assignmentId AND s.student.userEmail = :studentEmail")
    Integer findMaxVersionByAssignmentAndStudent(@Param("assignmentId") Long assignmentId, @Param("studentEmail") String studentEmail);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.assignment.id = :assignmentId")
    Long countByAssignment(@Param("assignmentId") Long assignmentId);

    @Query("SELECT COUNT(DISTINCT s.student) FROM Submission s WHERE s.assignment.id = :assignmentId")
    Long countUniqueStudentsByAssignment(@Param("assignmentId") Long assignmentId);

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.isLate = true")
    List<Submission> findLateSubmissions(@Param("assignmentId") Long assignmentId);

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.grade IS NULL")
    List<Submission> findUngradedSubmissions(@Param("assignmentId") Long assignmentId);

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.grade IS NOT NULL")
    List<Submission> findGradedSubmissions(@Param("assignmentId") Long assignmentId);

    boolean existsByAssignmentIdAndStudentUserEmail(Long assignmentId, String studentEmail);
}
