package com.campusmaster.Service;

import com.campusmaster.DAO.AssignmentDAO;
import com.campusmaster.DAO.CourseDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Assignment;
import com.campusmaster.Entity.Course;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentDAO assignmentDAO;

    @Autowired
    private CourseDAO courseDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private NotificationService notificationService;

    public List<Assignment> getAllAssignments() {
        return assignmentDAO.findAll();
    }

    public Optional<Assignment> getAssignmentById(Long id) {
        return assignmentDAO.findById(id);
    }

    public List<Assignment> getAssignmentsByCourse(Long courseId) {
        return assignmentDAO.findByCourseId(courseId);
    }

    public List<Assignment> getPublishedAssignmentsByCourse(Long courseId) {
        return assignmentDAO.findPublishedByCourseOrderByDeadline(courseId);
    }

    public List<Assignment> getAssignmentsByTeacher(String teacherEmail) {
        return assignmentDAO.findByTeacherEmail(teacherEmail);
    }

    public List<Assignment> getUpcomingAssignments() {
        return assignmentDAO.findUpcomingAssignments(LocalDateTime.now());
    }

    public List<Assignment> getAssignmentsForStudent(String studentEmail) {
        return assignmentDAO.findAssignmentsForStudent(studentEmail);
    }

    public List<Assignment> getUpcomingAssignmentsForStudent(String studentEmail) {
        return assignmentDAO.findUpcomingAssignmentsForStudent(studentEmail, LocalDateTime.now());
    }

    public Assignment createAssignment(Assignment assignment, Long courseId, String teacherEmail) {
        Course course = courseDAO.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        User teacher = userDAO.findByUserEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));

        // Verify teacher owns the course
        if (!course.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to create assignments for this course");
        }

        assignment.setCourse(course);
        assignment.setTeacher(teacher);
        assignment.setIsPublished(false);

        return assignmentDAO.save(assignment);
    }

    public Assignment updateAssignment(Long id, Assignment updatedAssignment, String teacherEmail) {
        Assignment assignment = assignmentDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

        // Verify the teacher owns this assignment
        if (!assignment.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to update this assignment");
        }

        if (updatedAssignment.getTitle() != null) {
            assignment.setTitle(updatedAssignment.getTitle());
        }
        if (updatedAssignment.getDescription() != null) {
            assignment.setDescription(updatedAssignment.getDescription());
        }
        if (updatedAssignment.getDeadline() != null) {
            assignment.setDeadline(updatedAssignment.getDeadline());
        }
        if (updatedAssignment.getMaxScore() != null) {
            assignment.setMaxScore(updatedAssignment.getMaxScore());
        }
        if (updatedAssignment.getAllowLateSubmission() != null) {
            assignment.setAllowLateSubmission(updatedAssignment.getAllowLateSubmission());
        }
        if (updatedAssignment.getLateSubmissionPenalty() != null) {
            assignment.setLateSubmissionPenalty(updatedAssignment.getLateSubmissionPenalty());
        }

        Assignment savedAssignment = assignmentDAO.save(assignment);

        // Notify students if the assignment is published
        if (Boolean.TRUE.equals(savedAssignment.getIsPublished())) {
            notificationService.notifyStudentsOfAssignmentUpdate(savedAssignment);
        }

        return savedAssignment;
    }

    public Assignment publishAssignment(Long id, String teacherEmail) {
        Assignment assignment = assignmentDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

        if (!assignment.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to publish this assignment");
        }

        assignment.setIsPublished(true);
        Assignment savedAssignment = assignmentDAO.save(assignment);

        // Notify students enrolled in the course
        notificationService.notifyStudentsOfNewAssignment(savedAssignment);

        return savedAssignment;
    }

    public Assignment unpublishAssignment(Long id, String teacherEmail) {
        Assignment assignment = assignmentDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

        if (!assignment.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to unpublish this assignment");
        }

        assignment.setIsPublished(false);
        return assignmentDAO.save(assignment);
    }

    public void deleteAssignment(Long id, String teacherEmail) {
        Assignment assignment = assignmentDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));

        if (!assignment.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to delete this assignment");
        }

        assignmentDAO.deleteById(id);
    }

    public Long countAssignmentsByCourse(Long courseId) {
        return assignmentDAO.countPublishedByCourse(courseId);
    }
}
