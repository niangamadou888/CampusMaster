package com.campusmaster.DAO;

import com.campusmaster.Entity.Course;
import com.campusmaster.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseDAO extends JpaRepository<Course, Long> {
    List<Course> findByTeacher(User teacher);
    List<Course> findBySubjectId(Long subjectId);
    List<Course> findByIsPublishedTrue();

    @Query("SELECT c FROM Course c WHERE c.teacher.userEmail = :teacherEmail")
    List<Course> findByTeacherEmail(@Param("teacherEmail") String teacherEmail);

    @Query("SELECT c FROM Course c WHERE c.isPublished = true ORDER BY c.createdAt DESC")
    List<Course> findPublishedCoursesOrderByDate();

    @Query("SELECT c FROM Course c WHERE c.subject.department.id = :departmentId AND c.isPublished = true")
    List<Course> findPublishedByDepartment(@Param("departmentId") Long departmentId);

    @Query("SELECT c FROM Course c WHERE c.subject.semester.id = :semesterId AND c.isPublished = true")
    List<Course> findPublishedBySemester(@Param("semesterId") Long semesterId);

    @Query("SELECT c FROM Course c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND c.isPublished = true")
    List<Course> searchByTitle(@Param("keyword") String keyword);
}
