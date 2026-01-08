package com.campusmaster.Controller;

import com.campusmaster.Entity.Course;
import com.campusmaster.Entity.CourseEnrollment;
import com.campusmaster.Service.CourseService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    @GetMapping
    public ResponseEntity<List<Course>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<List<Course>> getMyCourses(@RequestHeader("Authorization") String token) {
        String teacherEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(courseService.getCoursesByTeacher(teacherEmail));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Course>> getCoursesBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(courseService.getCoursesBySubject(subjectId));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Course>> getCoursesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(courseService.getCoursesByDepartment(departmentId));
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<Course>> getCoursesBySemester(@PathVariable Long semesterId) {
        return ResponseEntity.ok(courseService.getCoursesBySemester(semesterId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String keyword) {
        return ResponseEntity.ok(courseService.searchCourses(keyword));
    }

    @PostMapping
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Course> createCourse(
            @RequestBody Course course,
            @RequestParam Long subjectId,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Course created = courseService.createCourse(course, subjectId, teacherEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Course> updateCourse(
            @PathVariable Long id,
            @RequestBody Course course,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Course updated = courseService.updateCourse(id, course, teacherEmail);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Course> publishCourse(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Course published = courseService.publishCourse(id, teacherEmail);
            return ResponseEntity.ok(published);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Course> unpublishCourse(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            Course unpublished = courseService.unpublishCourse(id, teacherEmail);
            return ResponseEntity.ok(unpublished);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            courseService.deleteCourse(id, teacherEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Enrollment endpoints
    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<CourseEnrollment> enrollInCourse(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String studentEmail = extractEmailFromToken(token);
            CourseEnrollment enrollment = courseService.enrollStudent(id, studentEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}/unenroll")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<Void> unenrollFromCourse(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        try {
            String studentEmail = extractEmailFromToken(token);
            courseService.unenrollStudent(id, studentEmail);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasRole('Teacher') or hasRole('Admin')")
    public ResponseEntity<List<CourseEnrollment>> getEnrolledStudents(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getEnrolledStudents(id));
    }

    @GetMapping("/enrolled")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<List<CourseEnrollment>> getMyEnrollments(
            @RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(courseService.getStudentEnrollments(studentEmail));
    }

    @GetMapping("/{id}/enrollment-count")
    public ResponseEntity<Long> getEnrollmentCount(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getEnrollmentCount(id));
    }

    @GetMapping("/{id}/is-enrolled")
    @PreAuthorize("hasRole('User')")
    public ResponseEntity<Boolean> checkEnrollment(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        String studentEmail = extractEmailFromToken(token);
        return ResponseEntity.ok(courseService.isStudentEnrolled(id, studentEmail));
    }
}
