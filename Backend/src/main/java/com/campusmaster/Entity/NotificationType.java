package com.campusmaster.Entity;

public enum NotificationType {
    // Assignment notifications
    ASSIGNMENT_PUBLISHED("New Assignment Published"),
    ASSIGNMENT_UPDATED("Assignment Updated"),
    ASSIGNMENT_DEADLINE_REMINDER("Assignment Deadline Reminder"),

    // Grade notifications
    GRADE_RELEASED("Grade Released"),
    GRADE_UPDATED("Grade Updated"),

    // Submission notifications (for teachers)
    SUBMISSION_RECEIVED("New Submission Received"),

    // Course notifications
    COURSE_PUBLISHED("New Course Published"),
    COURSE_ENROLLMENT_APPROVED("Course Enrollment Approved"),
    COURSE_MATERIAL_ADDED("New Course Material Added"),

    // Teacher approval notifications
    TEACHER_APPROVED("Teacher Account Approved"),
    TEACHER_REGISTRATION_PENDING("New Teacher Registration Pending"),

    // Message notifications
    NEW_MESSAGE("New Private Message"),

    // General notifications
    ANNOUNCEMENT("Announcement"),
    SYSTEM("System Notification");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
