package com.campusmaster.Controller;

import com.campusmaster.Entity.CourseMaterial;
import com.campusmaster.Service.CourseMaterialService;
import com.campusmaster.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/materials")
public class CourseMaterialController {

    @Autowired
    private CourseMaterialService materialService;

    @Autowired
    private JwtUtil jwtUtil;

    private String extractEmailFromToken(String token) {
        return jwtUtil.extractUsername(token.replace("Bearer ", ""));
    }

    @GetMapping
    public ResponseEntity<List<CourseMaterial>> getMaterialsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialService.getMaterialsByCourse(courseId));
    }

    @GetMapping("/{materialId}")
    public ResponseEntity<CourseMaterial> getMaterialById(
            @PathVariable Long courseId,
            @PathVariable Long materialId) {
        return materialService.getMaterialById(materialId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<CourseMaterial> uploadMaterial(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            CourseMaterial material = materialService.uploadMaterial(
                    courseId, title, description, file, teacherEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(material);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{materialId}/download")
    public ResponseEntity<java.util.Map<String, String>> downloadMaterial(
            @PathVariable Long courseId,
            @PathVariable Long materialId) {
        try {
            // Get the Cloudinary URL and increment download count
            String downloadUrl = materialService.getDownloadUrl(materialId);

            // Return the URL in JSON format
            return ResponseEntity.ok(java.util.Map.of("url", downloadUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{materialId}")
    @PreAuthorize("hasRole('Teacher')")
    public ResponseEntity<Void> deleteMaterial(
            @PathVariable Long courseId,
            @PathVariable Long materialId,
            @RequestHeader("Authorization") String token) {
        try {
            String teacherEmail = extractEmailFromToken(token);
            materialService.deleteMaterial(materialId, teacherEmail);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/total-downloads")
    public ResponseEntity<Long> getTotalDownloads(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialService.getTotalDownloads(courseId));
    }
}
