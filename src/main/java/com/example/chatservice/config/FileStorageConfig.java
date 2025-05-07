package com.example.chatservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
    
    @Value("${file.upload-dir:${user.home}/chat_uploads}")
    private String uploadDir;
    
    @Bean
    public Path uploadDirectory() {
        Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
        File directory = path.toFile();
        if (!directory.exists()) {
            directory.mkdirs();
        }
        System.out.println("File upload directory created/verified at: " + path);
        return path;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations("file:" + uploadPath.toString() + File.separator)
                .setCachePeriod(3600)
                .resourceChain(true);
        
        System.out.println("Resource handler configured for path: " + uploadPath);
    }
}
