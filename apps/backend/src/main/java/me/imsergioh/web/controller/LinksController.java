package me.imsergioh.web.controller;

import jakarta.servlet.http.HttpServletRequest;
import me.imsergioh.web.dto.links.CreateLinkRequest;
import me.imsergioh.web.dto.links.RecordVisitRequest;
import me.imsergioh.web.dto.links.UpdateLinkRequest;
import me.imsergioh.web.model.LinkItem;
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
@RequestMapping("/api/links")
public class LinksController {

    private final LinksService linksService;

    public LinksController(LinksService linksService) {
        this.linksService = linksService;
    }

    @GetMapping
    public ResponseEntity<?> getAllLinks(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        List<LinkItem> items = linksService.getAllLinks();
        return ResponseEntity.ok(Map.of("ok", true, "items", items));
    }

    @PostMapping
    public ResponseEntity<?> createLink(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateLinkRequest req
    ) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        try {
            LinkItem item = linksService.createLink(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true, "item", item));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        } catch (Exception e) {
            File errFile = ErrorLogger.log("LinksController.createLink", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "server_error", "errorFile", errFile != null ? errFile.getName() : ""));
        }
    }

    @GetMapping("/{shortId}")
    public ResponseEntity<?> getLink(
            @PathVariable("shortId") String shortId
    ) {
        LinkItem item = linksService.getLinkByShortId(shortId);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("ok", false, "error", "not_found"));
        }
        return ResponseEntity.ok(Map.of("ok", true, "item", item));
    }

    @GetMapping("/resolve/{shortId}")
    public ResponseEntity<?> resolveLink(
            @PathVariable("shortId") String shortId
    ) {
        LinkItem item = linksService.getLinkByShortId(shortId);
        if (item == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("ok", false, "error", "not_found"));
        }
        return ResponseEntity.ok(Map.of("ok", true, "item", item));
    }

    @PatchMapping("/{shortId}")
    public ResponseEntity<?> updateLink(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("shortId") String shortId,
            @RequestBody UpdateLinkRequest req
    ) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        try {
            LinkItem updated = linksService.updateLink(shortId, req);
            return ResponseEntity.ok(Map.of("ok", true, "item", updated));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("ok", false, "error", "not_found"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("ok", false, "error", e.getMessage()));
        } catch (Exception e) {
            File errFile = ErrorLogger.log("LinksController.updateLink", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "server_error", "errorFile", errFile != null ? errFile.getName() : ""));
        }
    }

    @DeleteMapping("/{shortId}")
    public ResponseEntity<?> deleteLink(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("shortId") String shortId
    ) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        try {
            LinkItem deleted = linksService.deleteLink(shortId);
            return ResponseEntity.ok(Map.of("ok", true, "item", deleted));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("ok", false, "error", "not_found"));
        } catch (Exception e) {
            File errFile = ErrorLogger.log("LinksController.deleteLink", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "server_error", "errorFile", errFile != null ? errFile.getName() : ""));
        }
    }

    @PostMapping("/visit")
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
            File errFile = ErrorLogger.log("LinksController.recordVisit", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("ok", false, "error", "server_error", "errorFile", errFile != null ? errFile.getName() : ""));
        }
    }
}
