package com.campusmaster.DAO;

import com.campusmaster.Entity.Subject;
import com.campusmaster.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectDAO extends JpaRepository<Subject, Long> {
    Optional<Subject> findByCode(String code);
    boolean existsByCode(String code);

    List<Subject> findByDepartmentId(Long departmentId);
    List<Subject> findBySemesterId(Long semesterId);
    List<Subject> findByTeacher(User teacher);

    @Query("SELECT s FROM Subject s WHERE s.department.id = :departmentId AND s.semester.id = :semesterId")
    List<Subject> findByDepartmentAndSemester(@Param("departmentId") Long departmentId, @Param("semesterId") Long semesterId);

    @Query("SELECT s FROM Subject s WHERE s.teacher.userEmail = :teacherEmail")
    List<Subject> findByTeacherEmail(@Param("teacherEmail") String teacherEmail);
}
