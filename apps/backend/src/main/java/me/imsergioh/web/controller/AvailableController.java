package me.imsergioh.web.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import lombok.Getter;
import me.imsergioh.livecore.instance.handler.LiveStateHandler;
import me.imsergioh.livecore.instance.handler.WSChannelName;
import me.imsergioh.web.service.AvailabilityService;
import me.imsergioh.web.util.AuthUtils;

@RestController
@WSChannelName("available")
public class AvailableController implements LiveStateHandler<Boolean> {

    @Getter
    private static AvailableController instance;

    private final AvailabilityService service;

    public AvailableController(AvailabilityService service) {
        this.service = service;
        instance = this;
    }

    @Override
    @GetMapping("/available")
    public Boolean getData(Map<String, String> arg0) {
        return service.isAvailable();
    }

    @PostMapping({ "/available/toggle", "/api/available/toggle" })
    public ResponseEntity<?> toggleAvailable(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        boolean current = service.toggleAvailable();
        return ResponseEntity.ok(Map.of("ok", true, "available", current));
    }

    @PostMapping({ "/available/set", "/api/available/set" })
    public ResponseEntity<?> setAvailable(
            @org.springframework.web.bind.annotation.RequestParam(value = "status", required = false) Boolean statusParam,
            @org.springframework.web.bind.annotation.RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!AuthUtils.isValidAdminSessionToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("ok", false, "error", "unauthorized"));
        }

        Boolean targetAvailable = statusParam;
        String targetStatus = null;
        if (targetAvailable == null && body != null) {

            // Set avalable
            if (body.containsKey("available")) {
                Object val = body.get("available");
                targetAvailable = val instanceof Boolean ? (Boolean) val : Boolean.parseBoolean(String.valueOf(val));
            }

            if (body.containsKey("status")) {
                Object val = body.get("status");
                targetStatus = val instanceof String ? (String) val : String.valueOf(val);
                System.out.println("Discord presencia nuevo estado: " + targetStatus);
            }
        }

        if (targetAvailable == null) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "missing_available"));
        }

        boolean current = service.setAvailable(targetAvailable);
        return ResponseEntity.ok(Map.of("ok", true, "available", current));
    }

}
