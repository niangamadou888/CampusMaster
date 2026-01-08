package com.campusmaster.Service;

import com.campusmaster.DAO.GradeDAO;
import com.campusmaster.DAO.SubmissionDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Grade;
import com.campusmaster.Entity.Submission;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GradeService {

    @Autowired
    private GradeDAO gradeDAO;

    @Autowired
    private SubmissionDAO submissionDAO;

    @Autowired
    private UserDAO userDAO;

    public Optional<Grade> getGradeById(Long id) {
        return gradeDAO.findById(id);
    }

    public Optional<Grade> getGradeBySubmission(Long submissionId) {
        return gradeDAO.findBySubmissionId(submissionId);
    }

    public List<Grade> getGradesByStudent(String studentEmail) {
        return gradeDAO.findByStudentEmail(studentEmail);
    }

    public List<Grade> getGradesByCourse(Long courseId) {
        return gradeDAO.findByCourseId(courseId);
    }

    public List<Grade> getGradesByAssignment(Long assignmentId) {
        return gradeDAO.findByAssignmentId(assignmentId);
    }

    public List<Grade> getGradesByTeacher(String teacherEmail) {
        return gradeDAO.findByTeacherEmail(teacherEmail);
    }

    public List<Grade> getGradesByStudentAndCourse(String studentEmail, Long courseId) {
        return gradeDAO.findByStudentAndCourse(studentEmail, courseId);
    }

    public Grade gradeSubmission(Long submissionId, Double score, String feedback, String teacherEmail) {
        Submission submission = submissionDAO.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        User teacher = userDAO.findByUserEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));

        // Verify teacher owns the assignment's course
        if (!submission.getAssignment().getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to grade this submission");
        }

        // Check if already graded
        Optional<Grade> existingGrade = gradeDAO.findBySubmissionId(submissionId);
        if (existingGrade.isPresent()) {
            throw new RuntimeException("Submission is already graded. Use update instead.");
        }

        // Validate score
        Double maxScore = submission.getAssignment().getMaxScore();
        if (score < 0 || score > maxScore) {
            throw new RuntimeException("Score must be between 0 and " + maxScore);
        }

        Grade grade = new Grade();
        grade.setSubmission(submission);
        grade.setScore(score);
        grade.setFeedback(feedback);
        grade.setGradedBy(teacher);

        return gradeDAO.save(grade);
    }

    public Grade updateGrade(Long gradeId, Double score, String feedback, String teacherEmail) {
        Grade grade = gradeDAO.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Grade not found with id: " + gradeId));

        // Verify teacher owns the assignment
        if (!grade.getSubmission().getAssignment().getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to update this grade");
        }

        // Validate score
        Double maxScore = grade.getSubmission().getAssignment().getMaxScore();
        if (score < 0 || score > maxScore) {
            throw new RuntimeException("Score must be between 0 and " + maxScore);
        }

        grade.setScore(score);
        if (feedback != null) {
            grade.setFeedback(feedback);
        }

        return gradeDAO.save(grade);
    }

    public void deleteGrade(Long gradeId, String teacherEmail) {
        Grade grade = gradeDAO.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Grade not found with id: " + gradeId));

        if (!grade.getSubmission().getAssignment().getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to delete this grade");
        }

        gradeDAO.deleteById(gradeId);
    }

    // Statistics
    public Double getAverageScoreByAssignment(Long assignmentId) {
        return gradeDAO.getAverageScoreByAssignment(assignmentId);
    }

    public Double getAverageScoreByCourse(Long courseId) {
        return gradeDAO.getAverageScoreByCourse(courseId);
    }

    public Double getAverageScoreByStudent(String studentEmail) {
        return gradeDAO.getAverageScoreByStudent(studentEmail);
    }

    public Long countGradedSubmissions(Long assignmentId) {
        return gradeDAO.countGradedSubmissions(assignmentId);
    }
}
