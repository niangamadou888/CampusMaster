package com.campusmaster.Service;

import com.campusmaster.DAO.CourseEnrollmentDAO;
import com.campusmaster.DAO.NotificationDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationDAO notificationDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private CourseEnrollmentDAO courseEnrollmentDAO;

    @Autowired
    private EmailService emailService;

    // Core notification methods
    public Notification createNotification(User recipient, NotificationType type, String title, String message,
                                           String relatedEntityType, Long relatedEntityId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setNotificationType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);
        notification.setIsRead(false);

        return notificationDAO.save(notification);
    }

    public List<Notification> getNotificationsByUser(String userEmail) {
        return notificationDAO.findByRecipientEmail(userEmail);
    }

    public List<Notification> getUnreadNotifications(String userEmail) {
        return notificationDAO.findUnreadByRecipientEmail(userEmail);
    }

    public Long getUnreadCount(String userEmail) {
        return notificationDAO.countUnreadByRecipientEmail(userEmail);
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationDAO.findById(id);
    }

    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        Notification notification = notificationDAO.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to mark this notification as read");
        }

        notification.setIsRead(true);
        notificationDAO.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        notificationDAO.markAllAsReadByRecipientEmail(userEmail);
    }

    public void deleteNotification(Long notificationId, String userEmail) {
        Notification notification = notificationDAO.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to delete this notification");
        }

        notificationDAO.deleteById(notificationId);
    }

    // Assignment notifications
    public void notifyStudentsOfNewAssignment(Assignment assignment) {
        List<CourseEnrollment> enrollments = courseEnrollmentDAO.findByCourseId(assignment.getCourse().getId());

        String title = "New Assignment: " + assignment.getTitle();
        String message = String.format(
                "A new assignment '%s' has been published in course '%s'. Deadline: %s",
                assignment.getTitle(),
                assignment.getCourse().getTitle(),
                assignment.getDeadline() != null ? assignment.getDeadline().toString() : "No deadline"
        );

        for (CourseEnrollment enrollment : enrollments) {
            createNotification(
                    enrollment.getStudent(),
                    NotificationType.ASSIGNMENT_PUBLISHED,
                    title,
                    message,
                    "ASSIGNMENT",
                    assignment.getId()
            );

            // Send email notification
            sendEmailNotification(
                    enrollment.getStudent().getUserEmail(),
                    "[CampusMaster] " + title,
                    message
            );
        }
    }

    public void notifyStudentsOfAssignmentUpdate(Assignment assignment) {
        List<CourseEnrollment> enrollments = courseEnrollmentDAO.findByCourseId(assignment.getCourse().getId());

        String title = "Assignment Updated: " + assignment.getTitle();
        String message = String.format(
                "The assignment '%s' in course '%s' has been updated. Please check for changes.",
                assignment.getTitle(),
                assignment.getCourse().getTitle()
        );

        for (CourseEnrollment enrollment : enrollments) {
            createNotification(
                    enrollment.getStudent(),
                    NotificationType.ASSIGNMENT_UPDATED,
                    title,
                    message,
                    "ASSIGNMENT",
                    assignment.getId()
            );
        }
    }

    // Grade notifications
    public void notifyStudentOfGrade(Grade grade) {
        User student = grade.getSubmission().getStudent();
        Assignment assignment = grade.getSubmission().getAssignment();

        String title = "Grade Released: " + assignment.getTitle();
        String message = String.format(
                "Your submission for '%s' has been graded. Score: %.1f/%s. %s",
                assignment.getTitle(),
                grade.getScore(),
                assignment.getMaxScore(),
                grade.getFeedback() != null ? "Feedback: " + grade.getFeedback() : ""
        );

        createNotification(
                student,
                NotificationType.GRADE_RELEASED,
                title,
                message,
                "GRADE",
                grade.getId()
        );

        // Send email notification
        sendEmailNotification(
                student.getUserEmail(),
                "[CampusMaster] " + title,
                message
        );
    }

    public void notifyStudentOfGradeUpdate(Grade grade) {
        User student = grade.getSubmission().getStudent();
        Assignment assignment = grade.getSubmission().getAssignment();

        String title = "Grade Updated: " + assignment.getTitle();
        String message = String.format(
                "Your grade for '%s' has been updated. New Score: %.1f/%s. %s",
                assignment.getTitle(),
                grade.getScore(),
                assignment.getMaxScore(),
                grade.getFeedback() != null ? "Feedback: " + grade.getFeedback() : ""
        );

        createNotification(
                student,
                NotificationType.GRADE_UPDATED,
                title,
                message,
                "GRADE",
                grade.getId()
        );
    }

    // Submission notifications (for teachers)
    public void notifyTeacherOfSubmission(Submission submission) {
        User teacher = submission.getAssignment().getTeacher();
        User student = submission.getStudent();
        Assignment assignment = submission.getAssignment();

        String title = "New Submission: " + assignment.getTitle();
        String message = String.format(
                "Student %s %s has submitted assignment '%s' in course '%s'.",
                student.getUserFirstName(),
                student.getUserLastName(),
                assignment.getTitle(),
                assignment.getCourse().getTitle()
        );

        createNotification(
                teacher,
                NotificationType.SUBMISSION_RECEIVED,
                title,
                message,
                "SUBMISSION",
                submission.getId()
        );
    }

    // Course notifications
    public void notifyStudentsOfCourseMaterial(CourseMaterial material) {
        Course course = material.getCourse();
        List<CourseEnrollment> enrollments = courseEnrollmentDAO.findByCourseId(course.getId());

        String title = "New Material: " + material.getTitle();
        String message = String.format(
                "New course material '%s' has been added to course '%s'.",
                material.getTitle(),
                course.getTitle()
        );

        for (CourseEnrollment enrollment : enrollments) {
            createNotification(
                    enrollment.getStudent(),
                    NotificationType.COURSE_MATERIAL_ADDED,
                    title,
                    message,
                    "COURSE_MATERIAL",
                    material.getId()
            );
        }
    }

    // Teacher approval notifications
    public void notifyTeacherApproved(User teacher) {
        String title = "Account Approved";
        String message = "Congratulations! Your teacher account has been approved. You can now create courses and assignments.";

        createNotification(
                teacher,
                NotificationType.TEACHER_APPROVED,
                title,
                message,
                "USER",
                null
        );

        // Send email notification
        sendEmailNotification(
                teacher.getUserEmail(),
                "[CampusMaster] " + title,
                message
        );
    }

    public void notifyAdminsOfPendingTeacher(User newTeacher) {
        List<User> admins = new ArrayList<>();
        for (User user : userDAO.findAll()) {
            if (user.getRole().stream().anyMatch(role -> role.getRoleName().equals("Admin"))) {
                admins.add(user);
            }
        }

        String title = "New Teacher Registration";
        String message = String.format(
                "A new teacher registration is pending approval: %s %s (%s)",
                newTeacher.getUserFirstName(),
                newTeacher.getUserLastName(),
                newTeacher.getUserEmail()
        );

        for (User admin : admins) {
            createNotification(
                    admin,
                    NotificationType.TEACHER_REGISTRATION_PENDING,
                    title,
                    message,
                    "USER",
                    null
            );

            // Send email notification
            sendEmailNotification(
                    admin.getUserEmail(),
                    "[CampusMaster] " + title,
                    message
            );
        }
    }

    // Helper method for sending email notifications
    private void sendEmailNotification(String to, String subject, String content) {
        try {
            emailService.sendEmail(to, subject, content);
        } catch (Exception e) {
            // Log the error but don't fail the notification creation
            System.err.println("Failed to send email notification to " + to + ": " + e.getMessage());
        }
    }
}
