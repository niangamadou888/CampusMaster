package com.campusmaster.Service;

import com.campusmaster.DAO.AssignmentDAO;
import com.campusmaster.DAO.SubmissionDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Assignment;
import com.campusmaster.Entity.Submission;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubmissionService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private SubmissionDAO submissionDAO;

    @Autowired
    private AssignmentDAO assignmentDAO;

    @Autowired
    private UserDAO userDAO;

    public List<Submission> getSubmissionsByAssignment(Long assignmentId) {
        return submissionDAO.findByAssignmentId(assignmentId);
    }

    public List<Submission> getSubmissionsByStudent(String studentEmail) {
        return submissionDAO.findByStudentEmail(studentEmail);
    }

    public Optional<Submission> getSubmissionById(Long id) {
        return submissionDAO.findById(id);
    }

    public List<Submission> getStudentSubmissionsForAssignment(Long assignmentId, String studentEmail) {
        return submissionDAO.findByAssignmentIdAndStudentEmail(assignmentId, studentEmail);
    }

    public Optional<Submission> getLatestSubmission(Long assignmentId, String studentEmail) {
        return submissionDAO.findLatestByAssignmentIdAndStudentEmail(assignmentId, studentEmail);
    }

    public Submission submitAssignment(Long assignmentId, String studentEmail, MultipartFile file, String comment) throws IOException {
        Assignment assignment = assignmentDAO.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + assignmentId));

        User student = userDAO.findByUserEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found with email: " + studentEmail));

        // Check if assignment is published
        if (!assignment.getIsPublished()) {
            throw new RuntimeException("Assignment is not yet published");
        }

        // Check if deadline passed and late submissions not allowed
        LocalDateTime now = LocalDateTime.now();
        boolean isLate = assignment.getDeadline() != null && now.isAfter(assignment.getDeadline());

        if (isLate && !assignment.getAllowLateSubmission()) {
            throw new RuntimeException("Deadline has passed and late submissions are not allowed");
        }

        // Create upload directory
        Path uploadPath = Paths.get(uploadDir, "submissions", assignmentId.toString(), studentEmail);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
        Path filePath = uploadPath.resolve(uniqueFilename);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Determine version
        Integer maxVersion = submissionDAO.findMaxVersionByAssignmentAndStudent(assignmentId, studentEmail);
        int newVersion = (maxVersion != null) ? maxVersion + 1 : 1;

        // Create submission
        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setVersion(newVersion);
        submission.setFileName(originalFilename);
        submission.setFilePath(filePath.toString());
        submission.setFileSize(file.getSize());
        submission.setComment(comment);
        submission.setIsLate(isLate);

        return submissionDAO.save(submission);
    }

    public byte[] downloadSubmission(Long submissionId) throws IOException {
        Submission submission = submissionDAO.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        Path filePath = Paths.get(submission.getFilePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found on server");
        }

        return Files.readAllBytes(filePath);
    }

    public List<Submission> getUngradedSubmissions(Long assignmentId) {
        return submissionDAO.findUngradedSubmissions(assignmentId);
    }

    public List<Submission> getGradedSubmissions(Long assignmentId) {
        return submissionDAO.findGradedSubmissions(assignmentId);
    }

    public List<Submission> getLateSubmissions(Long assignmentId) {
        return submissionDAO.findLateSubmissions(assignmentId);
    }

    public Long countSubmissionsByAssignment(Long assignmentId) {
        return submissionDAO.countByAssignment(assignmentId);
    }

    public Long countUniqueStudentsByAssignment(Long assignmentId) {
        return submissionDAO.countUniqueStudentsByAssignment(assignmentId);
    }

    public boolean hasSubmitted(Long assignmentId, String studentEmail) {
        return submissionDAO.existsByAssignmentIdAndStudentUserEmail(assignmentId, studentEmail);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
