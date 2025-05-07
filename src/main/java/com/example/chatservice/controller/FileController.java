package com.example.chatservice.controller;

import com.example.chatservice.model.FileInfo;
import com.example.chatservice.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Autowired
    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileInfo> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            FileInfo fileInfo = fileStorageService.storeFile(file);
            return ResponseEntity.ok(fileInfo);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                String contentType = determineContentType(fileName);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    private String determineContentType(String fileName) {
        String fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        Map<String, String> contentTypeMap = new HashMap<>();
        
        // Common mime types
        contentTypeMap.put("pdf", "application/pdf");
        contentTypeMap.put("doc", "application/msword");
        contentTypeMap.put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        contentTypeMap.put("txt", "text/plain");
        contentTypeMap.put("jpg", "image/jpeg");
        contentTypeMap.put("jpeg", "image/jpeg");
        contentTypeMap.put("png", "image/png");
        contentTypeMap.put("gif", "image/gif");
        contentTypeMap.put("mp3", "audio/mpeg");
        contentTypeMap.put("mp4", "video/mp4");
        
        return contentTypeMap.getOrDefault(fileExtension, "application/octet-stream");
    }
}
