package com.campusmaster.Controller;

import com.campusmaster.Entity.Submission;
import com.campusmaster.Service.SubmissionService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Submission>> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
    }

    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<List<Submission>> getMySubmissions(@RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(studentEmail));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
        return submissionService.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/assignment/{assignmentId}/my-submission")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<Submission> getMySubmissionForAssignment(
            @PathVariable Long assignmentId,
            @RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return submissionService.getLatestSubmission(assignmentId, studentEmail)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/assignment/{assignmentId}/my-versions")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<List<Submission>> getMySubmissionVersions(
            @PathVariable Long assignmentId,
            @RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(submissionService.getStudentSubmissionsForAssignment(assignmentId, studentEmail));
    }

    @PostMapping(value = "/assignment/{assignmentId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestHeader("Authorization") String token) {
        try {
            String studentEmail = extractEmailFromToken(token);
            Submission submission = submissionService.submitAssignment(assignmentId, studentEmail, file, comment);
            return ResponseEntity.status(HttpStatus.CREATED).body(submission);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Map<String, String>> downloadSubmission(@PathVariable Long id) {
        try {
            // Get the Cloudinary URL
            String downloadUrl = submissionService.getDownloadUrl(id);

            // Return the URL in JSON format
            return ResponseEntity.ok(Map.of("url", downloadUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/assignment/{assignmentId}/ungraded")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Submission>> getUngradedSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getUngradedSubmissions(assignmentId));
    }

    @GetMapping("/assignment/{assignmentId}/graded")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Submission>> getGradedSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getGradedSubmissions(assignmentId));
    }

    @GetMapping("/assignment/{assignmentId}/late")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Submission>> getLateSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getLateSubmissions(assignmentId));
    }

    @GetMapping("/assignment/{assignmentId}/stats")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Map<String, Object>> getSubmissionStats(@PathVariable Long assignmentId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSubmissions", submissionService.countSubmissionsByAssignment(assignmentId));
        stats.put("uniqueStudents", submissionService.countUniqueStudentsByAssignment(assignmentId));
        stats.put("ungradedCount", submissionService.getUngradedSubmissions(assignmentId).size());
        stats.put("lateCount", submissionService.getLateSubmissions(assignmentId).size());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/assignment/{assignmentId}/has-submitted")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<Boolean> hasSubmitted(
            @PathVariable Long assignmentId,
            @RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(submissionService.hasSubmitted(assignmentId, studentEmail));
    }
}
