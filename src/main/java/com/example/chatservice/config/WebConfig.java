package com.example.chatservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${file.upload-dir:${user.home}/chat_uploads}")
    private String uploadDir;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8080") // Updated to match where the app will be served
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources from the React build directory
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // Serve the requested resource if it exists
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // For API paths, return null to allow the request to be handled by controllers
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }

                        // For everything else, serve index.html to support client-side routing
                        return new ClassPathResource("/static/index.html");
                    }
                });

        // Serve uploaded files
        String absoluteUploadDir = "file:" + Paths.get(uploadDir).toAbsolutePath().normalize().toString() + "/";
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations(absoluteUploadDir)
                .setCachePeriod(3600)
                .resourceChain(true);
    }
}
