package com.campusmaster.Service;

import com.campusmaster.DAO.AssignmentDAO;
import com.campusmaster.DAO.SubmissionDAO;
import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.Assignment;
import com.campusmaster.Entity.Submission;
import com.campusmaster.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionDAO submissionDAO;

    @Autowired
    private AssignmentDAO assignmentDAO;

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private NotificationService notificationService;

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

        // Upload file to Cloudinary
        String folder = "submissions/" + assignmentId + "/" + studentEmail.replace("@", "_at_");
        Map<String, Object> uploadResult = cloudinaryService.uploadFile(file, folder);

        String cloudinaryUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        // Get original filename
        String originalFilename = file.getOriginalFilename();

        // Determine version
        Integer maxVersion = submissionDAO.findMaxVersionByAssignmentAndStudent(assignmentId, studentEmail);
        int newVersion = (maxVersion != null) ? maxVersion + 1 : 1;

        // Create submission
        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setVersion(newVersion);
        submission.setFileName(originalFilename);
        submission.setFilePath(cloudinaryUrl);  // Store Cloudinary URL
        submission.setCloudinaryPublicId(publicId);  // Store public ID for deletion
        submission.setFileSize(file.getSize());
        submission.setComment(comment);
        submission.setIsLate(isLate);

        Submission savedSubmission = submissionDAO.save(submission);

        // Notify teacher of new submission
        notificationService.notifyTeacherOfSubmission(savedSubmission);

        return savedSubmission;
    }

    /**
     * Get the download URL for a submission (signed Cloudinary URL)
     */
    public String getDownloadUrl(Long submissionId) {
        Submission submission = submissionDAO.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        // Generate signed URL for secure access using stored public ID
        String signedUrl = cloudinaryService.generateSignedUrlFromPublicId(
                submission.getCloudinaryPublicId(),
                submission.getFilePath()
        );
        return signedUrl != null ? signedUrl : submission.getFilePath();
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
}
