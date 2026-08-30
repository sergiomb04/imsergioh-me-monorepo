package me.imsergioh.web.controller;

import jakarta.servlet.http.HttpServletRequest;
import me.imsergioh.web.dto.links.DeleteTrafficRequest;
import me.imsergioh.web.dto.links.RecordVisitRequest;
import me.imsergioh.web.model.TrafficItem;
import me.imsergioh.web.service.LinksService;
import me.imsergioh.web.util.AuthUtils;
import me.imsergioh.web.util.ErrorLogger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/links-data")
public class LinksDataController {

    private final LinksService linksService;

    public LinksDataController(LinksService linksService) {
        this.linksService = linksService;
    }

    @GetMapping
    public ResponseEntity<?> listTraffic(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "shortId", required = false) String shortId,
            @RequestParam(value = "limit", required = false, defaultValue = "200") Integer limit
    ) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        List<TrafficItem> items = linksService.getTraffic(shortId, limit);
        return ResponseEntity.ok(Map.of("ok", true, "items", items));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteTraffic(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody DeleteTrafficRequest req
    ) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        try {
            Map<String, Object> result = linksService.deleteTraffic(req);
            return ResponseEntity.ok(result);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("ok", false, "error", "not_found"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        } catch (Exception e) {
            File errFile = ErrorLogger.log("LinksDataController.deleteTraffic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "server_error", "errorFile", errFile != null ? errFile.getName() : ""));
        }
    }

    @PostMapping
    public ResponseEntity<?> recordVisit(
            @RequestBody RecordVisitRequest req,
            HttpServletRequest request
    ) {
        try {
            TrafficItem item = linksService.recordVisit(req, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true, "item", item));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        } catch (Exception e) {
            File errFile = ErrorLogger.log("LinksDataController.recordVisit", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "server_error", "errorFile", errFile != null ? errFile.getName() : ""));
        }
    }
}
