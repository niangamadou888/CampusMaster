package com.campusmaster.Controller;

import com.campusmaster.Entity.Grade;
import com.campusmaster.Service.GradeService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Grade> getGradeById(@PathVariable Long id) {
        return gradeService.getGradeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/submission/{submissionId}")
    @PreAuthorize("hasRole('User') or hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Grade> getGradeBySubmission(@PathVariable Long submissionId) {
        return gradeService.getGradeBySubmission(submissionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-grades")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<List<Grade>> getMyGrades(@RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(gradeService.getGradesByStudent(studentEmail));
    }

    @GetMapping("/my-grades/course/{courseId}")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<List<Grade>> getMyGradesByCourse(
            @PathVariable Long courseId,
            @RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(gradeService.getGradesByStudentAndCourse(studentEmail, courseId));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Grade>> getGradesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(gradeService.getGradesByCourse(courseId));
    }

    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Grade>> getGradesByAssignment(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(gradeService.getGradesByAssignment(assignmentId));
    }

    @GetMapping("/teacher/my-grades")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<List<Grade>> getGradesGivenByMe(@RequestHeader("Authorization") String token) {
        String teacherEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(gradeService.getGradesByTeacher(teacherEmail));
    }

    @PostMapping("/submission/{submissionId}")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Grade> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody GradeRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Grade grade = gradeService.gradeSubmission(submissionId, request.getScore(), request.getFeedback(), teacherEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(grade);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Grade> updateGrade(
            @PathVariable Long id,
            @RequestBody GradeRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Grade updated = gradeService.updateGrade(id, request.getScore(), request.getFeedback(), teacherEmail);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> deleteGrade(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            gradeService.deleteGrade(id, teacherEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Statistics endpoints
    @GetMapping("/stats/assignment/{assignmentId}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Map<String, Object>> getAssignmentStats(@PathVariable Long assignmentId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageScore", gradeService.getAverageScoreByAssignment(assignmentId));
        stats.put("gradedCount", gradeService.countGradedSubmissions(assignmentId));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/course/{courseId}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Map<String, Object>> getCourseStats(@PathVariable Long courseId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageScore", gradeService.getAverageScoreByCourse(courseId));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/my-average")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<Map<String, Object>> getMyAverageScore(@RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageScore", gradeService.getAverageScoreByStudent(studentEmail));
        return ResponseEntity.ok(stats);
    }

    // Inner class for grade request
    public static class GradeRequest {
        private Double score;
        private String feedback;

        public Double getScore() {
            return score;
        }

        public void setScore(Double score) {
            this.score = score;
        }

        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }
    }
}
