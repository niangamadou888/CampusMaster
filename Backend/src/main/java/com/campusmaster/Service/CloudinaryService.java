package com.campusmaster.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
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
        deleteFile(publicId, "raw");
    }

    /**
     * Delete a file from Cloudinary with specified resource type
     * @param publicId The public ID of the file to delete
     * @param resourceType The resource type (image, video, raw)
     */
    public void deleteFile(String publicId, String resourceType) throws IOException {
        if (publicId == null || publicId.isEmpty()) {
            return;
        }
        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
    }

    /**
     * Delete a file from Cloudinary using the stored URL to determine resource type
     * @param publicId The public ID of the file to delete
     * @param cloudinaryUrl The stored Cloudinary URL (used to determine resource type)
     */
    public void deleteFileWithUrl(String publicId, String cloudinaryUrl) throws IOException {
        if (publicId == null || publicId.isEmpty()) {
            return;
        }

        // Determine resource type from the stored URL
        String resourceType = "raw"; // Default to raw for documents
        if (cloudinaryUrl != null) {
            if (cloudinaryUrl.contains("/image/")) {
                resourceType = "image";
            } else if (cloudinaryUrl.contains("/video/")) {
                resourceType = "video";
            }
        }

        deleteFile(publicId, resourceType);
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

    /**
     * Generate a signed URL for accessing a file
     * @param publicId The public ID of the file
     * @param resourceType The resource type (image, video, raw)
     * @return Signed URL with authentication
     */
    public String generateSignedUrl(String publicId, String resourceType) {
        if (publicId == null || publicId.isEmpty()) {
            return null;
        }

        // Determine the resource type - PDFs and documents should use "raw"
        String type = resourceType != null ? resourceType : "raw";

        Map<String, Object> options = new HashMap<>();
        options.put("resource_type", type);
        options.put("type", "upload");
        options.put("sign_url", true);
        options.put("secure", true);

        return cloudinary.url()
                .resourceType(type)
                .type("upload")
                .signed(true)
                .secure(true)
                .generate(publicId);
    }

    /**
     * Generate a signed URL using the stored public ID and file path
     * @param publicId The stored Cloudinary public ID
     * @param filePath The stored Cloudinary URL (used to determine resource type)
     * @return Signed URL with authentication
     */
    public String generateSignedUrlFromPublicId(String publicId, String filePath) {
        if (publicId == null || publicId.isEmpty()) {
            // Fall back to URL parsing if no public ID stored
            return generateSignedUrlFromUrl(filePath);
        }

        // Determine resource type from the stored URL
        String resourceType = "raw"; // Default to raw for documents
        if (filePath != null) {
            if (filePath.contains("/image/")) {
                resourceType = "image";
            } else if (filePath.contains("/video/")) {
                resourceType = "video";
            }
        }

        return generateSignedUrl(publicId, resourceType);
    }

    /**
     * Generate a signed URL from a stored Cloudinary URL
     * @param cloudinaryUrl The stored Cloudinary URL
     * @return Signed URL with authentication
     */
    public String generateSignedUrlFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return null;
        }

        String publicId = extractPublicIdWithExtension(cloudinaryUrl);
        if (publicId == null) {
            return cloudinaryUrl; // Return original if we can't parse it
        }

        // Determine resource type from URL
        String resourceType = "raw"; // Default to raw for documents
        if (cloudinaryUrl.contains("/image/")) {
            resourceType = "image";
            // For images, remove the extension from public_id
            publicId = extractPublicId(cloudinaryUrl);
        } else if (cloudinaryUrl.contains("/video/")) {
            resourceType = "video";
            // For videos, remove the extension from public_id
            publicId = extractPublicId(cloudinaryUrl);
        }
        // For raw resources, keep the extension in public_id

        if (publicId == null) {
            return cloudinaryUrl;
        }

        return generateSignedUrl(publicId, resourceType);
    }

    /**
     * Extract the public ID from a Cloudinary URL, keeping the file extension
     * @param cloudinaryUrl The full Cloudinary URL
     * @return The public ID with extension
     */
    public String extractPublicIdWithExtension(String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.contains("cloudinary")) {
            return null;
        }

        try {
            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length > 1) {
                String pathWithVersion = parts[1];
                // Remove version prefix if present (v followed by numbers)
                if (pathWithVersion.startsWith("v") && pathWithVersion.contains("/")) {
                    pathWithVersion = pathWithVersion.substring(pathWithVersion.indexOf("/") + 1);
                }
                return pathWithVersion; // Keep the extension
            }
        } catch (Exception e) {
            // If parsing fails, return null
        }
        return null;
    }
}
