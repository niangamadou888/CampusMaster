package com.campusmaster.Service;

import com.campusmaster.DAO.DepartmentDAO;
import com.campusmaster.DAO.SemesterDAO;
import com.campusmaster.DAO.SubjectDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Department;
import com.campusmaster.Entity.Semester;
import com.campusmaster.Entity.Subject;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubjectService {

    @Autowired
    private SubjectDAO subjectDAO;

    @Autowired
    private DepartmentDAO departmentDAO;

    @Autowired
    private SemesterDAO semesterDAO;

    @Autowired
    private UserDAO userDAO;

    public List<Subject> getAllSubjects() {
        return subjectDAO.findAll();
    }

    public Optional<Subject> getSubjectById(Long id) {
        return subjectDAO.findById(id);
    }

    public Optional<Subject> getSubjectByCode(String code) {
        return subjectDAO.findByCode(code);
    }

    public List<Subject> getSubjectsByDepartment(Long departmentId) {
        return subjectDAO.findByDepartmentId(departmentId);
    }

    public List<Subject> getSubjectsBySemester(Long semesterId) {
        return subjectDAO.findBySemesterId(semesterId);
    }

    public List<Subject> getSubjectsByDepartmentAndSemester(Long departmentId, Long semesterId) {
        return subjectDAO.findByDepartmentAndSemester(departmentId, semesterId);
    }

    public List<Subject> getSubjectsByTeacher(String teacherEmail) {
        return subjectDAO.findByTeacherEmail(teacherEmail);
    }

    public Subject createSubject(Subject subject, Long departmentId, Long semesterId) {
        if (subjectDAO.existsByCode(subject.getCode())) {
            throw new RuntimeException("Subject with code " + subject.getCode() + " already exists");
        }

        Department department = departmentDAO.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + departmentId));

        Semester semester = semesterDAO.findById(semesterId)
                .orElseThrow(() -> new RuntimeException("Semester not found with id: " + semesterId));

        subject.setDepartment(department);
        subject.setSemester(semester);

        return subjectDAO.save(subject);
    }

    public Subject updateSubject(Long id, Subject updatedSubject) {
        return subjectDAO.findById(id)
                .map(subject -> {
                    if (updatedSubject.getName() != null) {
                        subject.setName(updatedSubject.getName());
                    }
                    if (updatedSubject.getCode() != null) {
                        subject.setCode(updatedSubject.getCode());
                    }
                    if (updatedSubject.getDescription() != null) {
                        subject.setDescription(updatedSubject.getDescription());
                    }
                    if (updatedSubject.getCredits() != null) {
                        subject.setCredits(updatedSubject.getCredits());
                    }
                    return subjectDAO.save(subject);
                })
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + id));
    }

    public Subject assignTeacher(Long subjectId, String teacherEmail) {
        Subject subject = subjectDAO.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));

        User teacher = userDAO.findByUserEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));

        // Verify user is a teacher
        boolean isTeacher = teacher.getRole().stream()
                .anyMatch(role -> "Teacher".equals(role.getRoleName()));

        if (!isTeacher) {
            throw new RuntimeException("User " + teacherEmail + " is not a teacher");
        }

        subject.setTeacher(teacher);
        return subjectDAO.save(subject);
    }

    public void deleteSubject(Long id) {
        if (!subjectDAO.existsById(id)) {
            throw new RuntimeException("Subject not found with id: " + id);
        }
        subjectDAO.deleteById(id);
    }
}
