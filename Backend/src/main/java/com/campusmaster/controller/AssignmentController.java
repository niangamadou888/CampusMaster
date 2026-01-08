package com.campusmaster.Controller;

import com.campusmaster.Entity.Assignment;
import com.campusmaster.Service.AssignmentService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable Long id) {
        return assignmentService.getAssignmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getPublishedAssignmentsByCourse(courseId));
    }

    @GetMapping("/course/{courseId}/all")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<Assignment>> getAllAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
    }

    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<List<Assignment>> getMyAssignments(@RequestHeader("Authorization") String token) {
        String teacherEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(assignmentService.getAssignmentsByTeacher(teacherEmail));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Assignment>> getUpcomingAssignments() {
        return ResponseEntity.ok(assignmentService.getUpcomingAssignments());
    }

    @GetMapping("/student/all")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<List<Assignment>> getAssignmentsForStudent(@RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(assignmentService.getAssignmentsForStudent(studentEmail));
    }

    @GetMapping("/student/upcoming")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<List<Assignment>> getUpcomingAssignmentsForStudent(@RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(assignmentService.getUpcomingAssignmentsForStudent(studentEmail));
    }

    @PostMapping
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Assignment> createAssignment(
            @RequestBody Assignment assignment,
            @RequestParam Long courseId,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Assignment created = assignmentService.createAssignment(assignment, courseId, teacherEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Assignment> updateAssignment(
            @PathVariable Long id,
            @RequestBody Assignment assignment,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Assignment updated = assignmentService.updateAssignment(id, assignment, teacherEmail);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Assignment> publishAssignment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Assignment published = assignmentService.publishAssignment(id, teacherEmail);
            return ResponseEntity.ok(published);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Assignment> unpublishAssignment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Assignment unpublished = assignmentService.unpublishAssignment(id, teacherEmail);
            return ResponseEntity.ok(unpublished);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            assignmentService.deleteAssignment(id, teacherEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/course/{courseId}/count")
    public ResponseEntity<Long> countAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.countAssignmentsByCourse(courseId));
    }
}
