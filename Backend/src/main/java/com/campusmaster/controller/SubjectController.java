package com.campusmaster.Controller;

import com.campusmaster.Entity.Subject;
import com.campusmaster.Service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        return subjectService.getSubjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Subject> getSubjectByCode(@PathVariable String code) {
        return subjectService.getSubjectByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Subject>> getSubjectsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(subjectService.getSubjectsByDepartment(departmentId));
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<Subject>> getSubjectsBySemester(@PathVariable Long semesterId) {
        return ResponseEntity.ok(subjectService.getSubjectsBySemester(semesterId));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Subject>> getSubjectsByDepartmentAndSemester(
            @RequestParam Long departmentId,
            @RequestParam Long semesterId) {
        return ResponseEntity.ok(subjectService.getSubjectsByDepartmentAndSemester(departmentId, semesterId));
    }

    @GetMapping("/teacher/{teacherEmail}")
    @PreAuthorize("hasRole('Admin') or hasRole('Teacher')")
    public ResponseEntity<List<Subject>> getSubjectsByTeacher(@PathVariable String teacherEmail) {
        return ResponseEntity.ok(subjectService.getSubjectsByTeacher(teacherEmail));
    }

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Subject> createSubject(
            @RequestBody Subject subject,
            @RequestParam Long departmentId,
            @RequestParam Long semesterId) {
        try {
            Subject created = subjectService.createSubject(subject, departmentId, semesterId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        try {
            Subject updated = subjectService.updateSubject(id, subject);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/assign-teacher")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Subject> assignTeacher(
            @PathVariable Long id,
            @RequestParam String teacherEmail) {
        try {
            Subject updated = subjectService.assignTeacher(id, teacherEmail);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
