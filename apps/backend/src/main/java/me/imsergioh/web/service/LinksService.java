package me.imsergioh.web.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.maxmind.geoip2.record.Country;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.http.HttpServletRequest;
import me.imsergioh.web.dto.links.CreateLinkRequest;
import me.imsergioh.web.dto.links.DeleteTrafficRequest;
import me.imsergioh.web.dto.links.RecordVisitRequest;
import me.imsergioh.web.dto.links.UpdateLinkRequest;
import me.imsergioh.web.model.LinkItem;
import me.imsergioh.web.model.TrafficItem;
import me.imsergioh.web.util.DataUtil;
import me.imsergioh.web.util.ErrorLogger;
import me.imsergioh.web.util.IpMaskUtils;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class LinksService {

    private static final String DATA_DIR = "data";
    private static final String LINKS_FILE_PATH = "data/links.json";
    private static final String TRAFFIC_FILE_PATH = "data/traffic.json";

    private static final Pattern SHORT_ID_PATTERN = Pattern.compile("^[a-z0-9_-]{3,64}$");
    private static final String ALPHANUM = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ObjectMapper objectMapper;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    private final Map<String, LinkItem> linksById = new ConcurrentHashMap<>();
    private final Map<String, LinkItem> linksByShortId = new ConcurrentHashMap<>();
    private final List<TrafficItem> trafficList = new CopyOnWriteArrayList<>();

    private volatile ScheduledFuture<?> pendingLinksSave = null;
    private volatile ScheduledFuture<?> pendingTrafficSave = null;
    private final Object linksSaveLock = new Object();
    private final Object trafficSaveLock = new Object();

    public LinksService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @PostConstruct
    public synchronized void init() {
        loadLinks();
        loadTraffic();
    }

    @PreDestroy
    public synchronized void shutdown() {
        scheduler.shutdown();
        saveLinksNow();
        saveTrafficNow();
    }

    // --- Loading & Persistence ---

    private void loadLinks() {
        try {
            File file = new File(LINKS_FILE_PATH);
            ensureParentDir(file);
            if (!file.exists()) {
                saveLinksNow();
                return;
            }
            List<LinkItem> list = objectMapper.readValue(file, new TypeReference<List<LinkItem>>() {});
            if (list != null) {
                for (LinkItem item : list) {
                    if (item.getId() == null) {
                        item.setId(generateId("link"));
                    }
                    if (item.getShortId() != null) {
                        linksById.put(item.getId(), item);
                        linksByShortId.put(item.getShortId().toLowerCase(), item);
                    }
                }
            }
        } catch (Exception e) {
            ErrorLogger.log("LinksService.loadLinks", e);
            e.printStackTrace();
        }
    }

    private void loadTraffic() {
        try {
            File file = new File(TRAFFIC_FILE_PATH);
            ensureParentDir(file);
            if (!file.exists()) {
                saveTrafficNow();
                return;
            }
            List<TrafficItem> list = objectMapper.readValue(file, new TypeReference<List<TrafficItem>>() {});
            if (list != null) {
                trafficList.addAll(list);
            }
        } catch (Exception e) {
            ErrorLogger.log("LinksService.loadTraffic", e);
            e.printStackTrace();
        }
    }

    public void scheduleLinksSave() {
        synchronized (linksSaveLock) {
            if (pendingLinksSave != null && !pendingLinksSave.isDone()) {
                pendingLinksSave.cancel(false);
            }
            pendingLinksSave = scheduler.schedule(this::saveLinksNow, 500, TimeUnit.MILLISECONDS);
        }
    }

    public void scheduleTrafficSave() {
        synchronized (trafficSaveLock) {
            if (pendingTrafficSave != null && !pendingTrafficSave.isDone()) {
                pendingTrafficSave.cancel(false);
            }
            pendingTrafficSave = scheduler.schedule(this::saveTrafficNow, 500, TimeUnit.MILLISECONDS);
        }
    }

    public synchronized void saveLinksNow() {
        try {
            File targetFile = new File(LINKS_FILE_PATH);
            ensureParentDir(targetFile);
            File tempFile = new File(LINKS_FILE_PATH + ".tmp");

            List<LinkItem> items = new ArrayList<>(linksById.values());
            // Make sure clickCount is not persisted into links.json to keep original schema clean
            List<Map<String, Object>> serializedItems = items.stream().map(l -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", l.getId());
                map.put("shortId", l.getShortId());
                map.put("targetUrl", l.getTargetUrl());
                map.put("title", l.getTitle() != null ? l.getTitle() : "");
                map.put("createdAt", l.getCreatedAt());
                map.put("updatedAt", l.getUpdatedAt());
                return map;
            }).collect(Collectors.toList());

            objectMapper.writeValue(tempFile, serializedItems);
            Files.move(tempFile.toPath(), targetFile.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            ErrorLogger.log("LinksService.saveLinksNow", e);
            e.printStackTrace();
        }
    }

    public synchronized void saveTrafficNow() {
        try {
            File targetFile = new File(TRAFFIC_FILE_PATH);
            ensureParentDir(targetFile);
            File tempFile = new File(TRAFFIC_FILE_PATH + ".tmp");

            objectMapper.writeValue(tempFile, new ArrayList<>(trafficList));
            Files.move(tempFile.toPath(), targetFile.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            ErrorLogger.log("LinksService.saveTrafficNow", e);
            e.printStackTrace();
        }
    }

    private void ensureParentDir(File file) {
        File parent = file.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }
    }

    // --- Link Operations ---

    public List<LinkItem> getAllLinks() {
        List<LinkItem> list = new ArrayList<>(linksById.values());
        list.sort((a, b) -> {
            String timeA = a.getCreatedAt() != null ? a.getCreatedAt() : "";
            String timeB = b.getCreatedAt() != null ? b.getCreatedAt() : "";
            return timeB.compareTo(timeA);
        });

        for (LinkItem item : list) {
            item.setClickCount(countClicks(item.getShortId()));
        }
        return list;
    }

    public LinkItem getLinkByShortId(String shortId) {
        if (shortId == null) return null;
        LinkItem item = linksByShortId.get(shortId.trim().toLowerCase());
        if (item != null) {
            item.setClickCount(countClicks(item.getShortId()));
        }
        return item;
    }

    public LinkItem createLink(CreateLinkRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("invalid_request");
        }

        String shortId = normalizeShortId(req.getShortId());
        validateShortId(shortId);
        validateTargetUrl(req.getTargetUrl());

        if (linksByShortId.containsKey(shortId)) {
            throw new IllegalStateException("short_id_already_exists");
        }

        String now = Instant.now().toString();
        String id = generateId("link");
        String title = req.getTitle() != null ? req.getTitle().trim() : "";

        LinkItem item = new LinkItem(id, shortId, req.getTargetUrl().trim(), title, now, now);
        item.setClickCount(0L);

        linksById.put(id, item);
        linksByShortId.put(shortId, item);
        scheduleLinksSave();

        return item;
    }

    public LinkItem updateLink(String currentShortId, UpdateLinkRequest req) {
        if (currentShortId == null || req == null) {
            throw new IllegalArgumentException("invalid_request");
        }

        LinkItem existing = linksByShortId.get(currentShortId.trim().toLowerCase());
        if (existing == null) {
            throw new NoSuchElementException("not_found");
        }

        String newShortId = req.getShortId() != null ? normalizeShortId(req.getShortId()) : null;
        if (newShortId != null && !newShortId.equalsIgnoreCase(existing.getShortId())) {
            validateShortId(newShortId);
            if (linksByShortId.containsKey(newShortId)) {
                throw new IllegalStateException("short_id_already_exists");
            }
            // Update shortId in traffic entries
            String oldShortId = existing.getShortId();
            linksByShortId.remove(oldShortId.toLowerCase());
            existing.setShortId(newShortId);
            linksByShortId.put(newShortId, existing);

            boolean trafficChanged = false;
            for (TrafficItem traffic : trafficList) {
                if (traffic.getShortId() != null && traffic.getShortId().equalsIgnoreCase(oldShortId)) {
                    traffic.setShortId(newShortId);
                    trafficChanged = true;
                }
            }
            if (trafficChanged) {
                scheduleTrafficSave();
            }
        }

        if (req.getTargetUrl() != null && !req.getTargetUrl().isBlank()) {
            validateTargetUrl(req.getTargetUrl());
            existing.setTargetUrl(req.getTargetUrl().trim());
        }

        if (req.getTitle() != null) {
            existing.setTitle(req.getTitle().trim());
        }

        existing.setUpdatedAt(Instant.now().toString());
        existing.setClickCount(countClicks(existing.getShortId()));

        scheduleLinksSave();
        return existing;
    }

    public LinkItem deleteLink(String shortId) {
        if (shortId == null) {
            throw new NoSuchElementException("not_found");
        }

        LinkItem existing = linksByShortId.remove(shortId.trim().toLowerCase());
        if (existing == null) {
            throw new NoSuchElementException("not_found");
        }

        linksById.remove(existing.getId());

        // Delete associated traffic
        String targetShortId = existing.getShortId();
        trafficList.removeIf(t -> t.getShortId() != null && t.getShortId().equalsIgnoreCase(targetShortId));

        scheduleLinksSave();
        scheduleTrafficSave();

        return existing;
    }

    public long countClicks(String shortId) {
        if (shortId == null) return 0;
        return trafficList.stream()
                .filter(t -> t.getShortId() != null && t.getShortId().equalsIgnoreCase(shortId))
                .count();
    }

    // --- Traffic Operations ---

    public List<TrafficItem> getTraffic(String shortId, Integer limit) {
        int max = limit != null ? Math.min(Math.max(1, limit), 500) : 200;

        List<TrafficItem> list = new ArrayList<>(trafficList);
        if (shortId != null && !shortId.isBlank()) {
            String filter = shortId.trim().toLowerCase();
            list = list.stream()
                    .filter(t -> t.getShortId() != null && t.getShortId().equalsIgnoreCase(filter))
                    .collect(Collectors.toList());
        }

        // Sort descending by openedAt
        list.sort((a, b) -> {
            String timeA = a.getOpenedAt() != null ? a.getOpenedAt() : "";
            String timeB = b.getOpenedAt() != null ? b.getOpenedAt() : "";
            return timeB.compareTo(timeA);
        });

        if (list.size() > max) {
            return list.subList(0, max);
        }
        return list;
    }

    public Map<String, Object> deleteTraffic(DeleteTrafficRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("invalid_request");
        }

        if (Boolean.TRUE.equals(req.getDeleteAll())) {
            int count = trafficList.size();
            trafficList.clear();
            scheduleTrafficSave();
            return Map.of("ok", true, "mode", "all", "deletedCount", count);
        }

        if (req.getShortId() != null && !req.getShortId().isBlank()) {
            String target = req.getShortId().trim();
            int before = trafficList.size();
            trafficList.removeIf(t -> t.getShortId() != null && t.getShortId().equalsIgnoreCase(target));
            int count = before - trafficList.size();
            scheduleTrafficSave();
            return Map.of("ok", true, "mode", "shortId", "deletedCount", count);
        }

        if (req.getId() != null && !req.getId().isBlank()) {
            String id = req.getId().trim();
            TrafficItem found = null;
            for (TrafficItem item : trafficList) {
                if (id.equals(item.getId())) {
                    found = item;
                    break;
                }
            }
            if (found != null) {
                trafficList.remove(found);
                scheduleTrafficSave();
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("ok", true);
                res.put("mode", "single");
                res.put("deleted", found);
                return res;
            } else {
                throw new NoSuchElementException("not_found");
            }
        }

        throw new IllegalArgumentException("invalid_request");
    }

    public TrafficItem recordVisit(RecordVisitRequest req, HttpServletRequest request) {
        String shortId = req != null && req.getShortId() != null ? req.getShortId().trim() : null;
        if (shortId == null || shortId.isBlank()) {
            throw new IllegalArgumentException("invalid_short_id");
        }

        String ip = (req != null && req.getIp() != null && !req.getIp().isBlank())
                ? req.getIp().trim()
                : IpMaskUtils.getClientIp(request);

        String userAgent = (req != null && req.getUserAgent() != null && !req.getUserAgent().isBlank())
                ? req.getUserAgent().trim()
                : (request != null ? request.getHeader("User-Agent") : "");
        if (userAgent == null) userAgent = "";

        String referer = (req != null && req.getReferer() != null && !req.getReferer().isBlank())
                ? req.getReferer().trim()
                : (request != null ? request.getHeader("Referer") : "");
        if (referer == null) referer = "";

        String targetUrl = (req != null && req.getTargetUrl() != null && !req.getTargetUrl().isBlank())
                ? req.getTargetUrl().trim()
                : "";
        if (targetUrl.isBlank()) {
            LinkItem link = linksByShortId.get(shortId.toLowerCase());
            if (link != null) {
                targetUrl = link.getTargetUrl();
            }
        }

        String countryName = null;
        Country country = DataUtil.getCountry(ip);
        if (country != null) {
            if (country.getNames() != null && country.getNames().containsKey("es")) {
                countryName = country.getNames().get("es");
            } else {
                countryName = country.getName();
            }
        }

        String ipMasked = IpMaskUtils.maskIp(ip);
        String id = generateId("trf");
        String openedAt = Instant.now().toString();

        TrafficItem item = new TrafficItem(
                id,
                shortId,
                targetUrl,
                ip,
                ipMasked,
                countryName,
                null,
                userAgent,
                referer,
                openedAt
        );

        trafficList.add(item);
        scheduleTrafficSave();

        return item;
    }

    // --- Helpers & Validation ---

    private String normalizeShortId(String shortId) {
        return shortId != null ? shortId.trim().toLowerCase() : "";
    }

    private void validateShortId(String shortId) {
        if (shortId == null || !SHORT_ID_PATTERN.matcher(shortId).matches()) {
            throw new IllegalArgumentException("invalid_short_id");
        }
    }

    private void validateTargetUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("invalid_target_url");
        }
        String trimmed = url.trim();
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            throw new IllegalArgumentException("invalid_target_url");
        }
        try {
            URI uri = URI.create(trimmed);
            if (uri.getHost() == null) {
                throw new IllegalArgumentException("invalid_target_url");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("invalid_target_url");
        }
    }

    private String generateId(String prefix) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
        }
        return prefix + "_" + System.currentTimeMillis() + "_" + sb;
    }
}
