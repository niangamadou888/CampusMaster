package com.campusmaster.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Upload a file to Cloudinary
     * @param file The file to upload
     * @param folder The folder path in Cloudinary (e.g., "courses/1")
     * @return Map containing upload result with "secure_url" and "public_id"
     */
    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException {
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", "campusmaster/" + folder,
                "resource_type", "auto",
                "access_mode", "public",
                "type", "upload"
        );

        return cloudinary.uploader().upload(file.getBytes(), options);
    }

    /**
     * Delete a file from Cloudinary
     * @param publicId The public ID of the file to delete
     */
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "auto"));
    }

    /**
     * Extract the public ID from a Cloudinary URL
     * @param cloudinaryUrl The full Cloudinary URL
     * @return The public ID
     */
    public String extractPublicId(String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary")) {
            return null;
        }

        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
        // We need to extract the public_id part
        try {
            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length > 1) {
                String pathWithVersion = parts[1];
                // Remove version prefix if present (v followed by numbers)
                if (pathWithVersion.startsWith("v") && pathWithVersion.contains("/")) {
                    pathWithVersion = pathWithVersion.substring(pathWithVersion.indexOf("/") + 1);
                }
                // Remove file extension
                int lastDotIndex = pathWithVersion.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    return pathWithVersion.substring(0, lastDotIndex);
                }
                return pathWithVersion;
            }
        } catch (Exception e) {
            // If parsing fails, return null
        }
        return null;
    }
}
