package com.example.chatservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileInfo {
    private String fileName;
    private String originalFileName;
    private String contentType;
    private long size;
    private String url;
    private String fileType; // document, image, video, audio, other
}
