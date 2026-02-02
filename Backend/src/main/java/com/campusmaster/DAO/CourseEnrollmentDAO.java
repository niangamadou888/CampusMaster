package com.campusmaster.DAO;

import com.campusmaster.Entity.CourseEnrollment;
import com.campusmaster.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentDAO extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByCourseId(Long courseId);
    List<CourseEnrollment> findByStudent(User student);

    @Query("SELECT ce FROM CourseEnrollment ce WHERE ce.student.userEmail = :studentEmail")
    List<CourseEnrollment> findByStudentEmail(@Param("studentEmail") String studentEmail);

    @Query("SELECT ce FROM CourseEnrollment ce WHERE ce.course.id = :courseId AND ce.student.userEmail = :studentEmail")
    Optional<CourseEnrollment> findByCourseIdAndStudentEmail(@Param("courseId") Long courseId, @Param("studentEmail") String studentEmail);

    boolean existsByCourseIdAndStudentUserEmail(Long courseId, String studentEmail);

    @Query("SELECT COUNT(ce) FROM CourseEnrollment ce WHERE ce.course.id = :courseId AND ce.status = 'ACTIVE'")
    Long countActiveEnrollmentsByCourse(@Param("courseId") Long courseId);

    @Query("SELECT ce FROM CourseEnrollment ce WHERE ce.student.userEmail = :studentEmail AND ce.status = 'ACTIVE'")
    List<CourseEnrollment> findActiveEnrollmentsByStudent(@Param("studentEmail") String studentEmail);
}
