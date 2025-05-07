package com.example.chatservice.service;

import com.example.chatservice.model.FileInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    // List of allowed file extensions
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            // Documents
            "pdf", "doc", "docx", "txt", "rtf", "xls", "xlsx", "csv", "ppt", "pptx",
            // Images
            "jpg", "jpeg", "png", "gif", "svg", "webp",
            // Audio
            "mp3", "wav", "ogg",
            // Video
            "mp4", "webm", "avi", "mov",
            // Archives
            "zip", "rar", "7z"
    );

    // Max file size (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            System.out.println("File upload directory created at: " + uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }
    
    public FileInfo storeFile(MultipartFile file) throws IOException {
        // Perform file validation
        validateFile(file);
        
        // Get the upload directory path
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        // Generate a unique file name to prevent conflicts
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + "." + fileExtension;
        
        // Copy the file to the upload directory
        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        // Create and return file info
        FileInfo fileInfo = new FileInfo();
        fileInfo.setFileName(fileName);
        fileInfo.setOriginalFileName(originalFileName);
        fileInfo.setContentType(file.getContentType());
        fileInfo.setSize(file.getSize());
        fileInfo.setUrl("/api/files/" + fileName);
        fileInfo.setFileType(categorizeFileType(file.getContentType(), fileExtension));
        
        return fileInfo;
    }
    
    private void validateFile(MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10MB");
        }
        
        // Check file extension
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(fileName).toLowerCase();
        
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new IllegalArgumentException("File type not allowed. Allowed extensions: " 
                    + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }
    
    private String getFileExtension(String fileName) {
        try {
            return fileName.substring(fileName.lastIndexOf(".") + 1);
        } catch (Exception e) {
            return "";
        }
    }
    
    private String categorizeFileType(String contentType, String extension) {
        if (contentType == null) {
            return categorizeByExtension(extension);
        }
        
        if (contentType.startsWith("image/")) {
            return "image";
        } else if (contentType.startsWith("video/")) {
            return "video";
        } else if (contentType.startsWith("audio/")) {
            return "audio";
        } else if (contentType.startsWith("application/pdf") 
                || contentType.startsWith("application/msword")
                || contentType.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml")
                || contentType.startsWith("application/vnd.ms-excel")
                || contentType.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml")
                || contentType.startsWith("application/vnd.ms-powerpoint")
                || contentType.startsWith("application/vnd.openxmlformats-officedocument.presentationml")
                || contentType.startsWith("text/")) {
            return "document";
        } else {
            return "other";
        }
    }
    
    private String categorizeByExtension(String extension) {
        extension = extension.toLowerCase();
        
        // Images
        if (extension.matches("jpg|jpeg|png|gif|svg|webp")) {
            return "image";
        }
        
        // Videos
        if (extension.matches("mp4|webm|avi|mov")) {
            return "video";
        }
        
        // Audio
        if (extension.matches("mp3|wav|ogg")) {
            return "audio";
        }
        
        // Documents
        if (extension.matches("pdf|doc|docx|txt|rtf|xls|xlsx|csv|ppt|pptx")) {
            return "document";
        }
        
        return "other";
    }
}

