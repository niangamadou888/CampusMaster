package com.campusmaster.Service;

import com.campusmaster.DAO.CourseDAO;
import com.campusmaster.DAO.CourseMaterialDAO;
import com.campusmaster.Entity.Course;
import com.campusmaster.Entity.CourseMaterial;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CourseMaterialService {

    @Autowired
    private CourseMaterialDAO materialDAO;

    @Autowired
    private CourseDAO courseDAO;

    @Autowired
    private CloudinaryService cloudinaryService;

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

        // Upload file to Cloudinary
        String folder = "courses/" + courseId;
        Map<String, Object> uploadResult = cloudinaryService.uploadFile(file, folder);

        String cloudinaryUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        // Get file info
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);

        // Create material record
        CourseMaterial material = new CourseMaterial();
        material.setCourse(course);
        material.setTitle(title);
        material.setDescription(description);
        material.setFileName(originalFilename);
        material.setFilePath(cloudinaryUrl);  // Store Cloudinary URL
        material.setCloudinaryPublicId(publicId);  // Store public ID for deletion
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

        // Delete file from Cloudinary using URL to determine resource type
        String publicId = material.getCloudinaryPublicId();
        if (publicId != null && !publicId.isEmpty()) {
            cloudinaryService.deleteFileWithUrl(publicId, material.getFilePath());
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

    /**
     * Get the download URL for a material (signed Cloudinary URL)
     */
    @Transactional
    public String getDownloadUrl(Long materialId) {
        CourseMaterial material = materialDAO.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + materialId));

        // Increment download count
        incrementDownloadCount(materialId);

        // Generate signed URL for secure access using stored public ID
        String signedUrl = cloudinaryService.generateSignedUrlFromPublicId(
                material.getCloudinaryPublicId(),
                material.getFilePath()
        );
        return signedUrl != null ? signedUrl : material.getFilePath();
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
