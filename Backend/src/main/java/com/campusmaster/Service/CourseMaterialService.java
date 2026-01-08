package com.campusmaster.Service;

import com.campusmaster.DAO.CourseDAO;
import com.campusmaster.DAO.CourseMaterialDAO;
import com.campusmaster.Entity.Course;
import com.campusmaster.Entity.CourseMaterial;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CourseMaterialService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private CourseMaterialDAO materialDAO;

    @Autowired
    private CourseDAO courseDAO;

    public List<CourseMaterial> getMaterialsByCourse(Long courseId) {
        return materialDAO.findByCourseIdOrderByUploadedAtDesc(courseId);
    }

    public Optional<CourseMaterial> getMaterialById(Long id) {
        return materialDAO.findById(id);
    }

    public CourseMaterial uploadMaterial(Long courseId, String title, String description,
                                         MultipartFile file, String teacherEmail) throws IOException {
        Course course = courseDAO.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Verify teacher owns the course
        if (!course.getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to upload materials to this course");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "courses", courseId.toString());
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

        // Create material record
        CourseMaterial material = new CourseMaterial();
        material.setCourse(course);
        material.setTitle(title);
        material.setDescription(description);
        material.setFileName(originalFilename);
        material.setFilePath(filePath.toString());
        material.setFileSize(file.getSize());
        material.setFileType(determineFileType(extension));

        return materialDAO.save(material);
    }

    public void deleteMaterial(Long materialId, String teacherEmail) throws IOException {
        CourseMaterial material = materialDAO.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + materialId));

        // Verify teacher owns the course
        if (!material.getCourse().getTeacher().getUserEmail().equals(teacherEmail)) {
            throw new RuntimeException("You are not authorized to delete this material");
        }

        // Delete file from filesystem
        Path filePath = Paths.get(material.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // Delete database record
        materialDAO.deleteById(materialId);
    }

    @Transactional
    public void incrementDownloadCount(Long materialId) {
        materialDAO.incrementDownloadCount(materialId);
    }

    public Long getTotalDownloads(Long courseId) {
        Long total = materialDAO.getTotalDownloadsByCourse(courseId);
        return total != null ? total : 0L;
    }

    public byte[] downloadMaterial(Long materialId) throws IOException {
        CourseMaterial material = materialDAO.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + materialId));

        Path filePath = Paths.get(material.getFilePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found on server");
        }

        // Increment download count
        incrementDownloadCount(materialId);

        return Files.readAllBytes(filePath);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private CourseMaterial.FileType determineFileType(String extension) {
        switch (extension.toLowerCase()) {
            case "pdf":
                return CourseMaterial.FileType.PDF;
            case "ppt":
                return CourseMaterial.FileType.PPT;
            case "pptx":
                return CourseMaterial.FileType.PPTX;
            case "doc":
                return CourseMaterial.FileType.DOC;
            case "docx":
                return CourseMaterial.FileType.DOCX;
            case "mp4":
            case "avi":
            case "mov":
            case "mkv":
                return CourseMaterial.FileType.VIDEO;
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
                return CourseMaterial.FileType.IMAGE;
            default:
                return CourseMaterial.FileType.OTHER;
        }
    }
}
