package me.imsergioh.web.controller;

import me.imsergioh.web.dto.FileInfoDto;
import me.imsergioh.web.dto.UploadResponseDto;
import me.imsergioh.web.service.CdnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cdn")
public class CdnController {

    private final CdnService cdnService;

    public CdnController(CdnService cdnService) {
        this.cdnService = cdnService;
    }

    @GetMapping
    public ResponseEntity<List<FileInfoDto>> getFiles() throws Exception {

        return ResponseEntity.ok(
                cdnService.listFiles()
        );
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponseDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String path
    ) throws Exception {

        String uploadedPath =
                cdnService.uploadFile(file, path);

        return ResponseEntity.ok(
                new UploadResponseDto(
                        true,
                        "Archivo subido correctamente",
                        uploadedPath
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteFile(
            @RequestParam String path
    ) throws Exception {

        cdnService.deleteFile(path);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Archivo eliminado"
                )
        );
    }
}
