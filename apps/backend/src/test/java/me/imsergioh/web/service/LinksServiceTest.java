package me.imsergioh.web.service;

import me.imsergioh.web.dto.links.CreateLinkRequest;
import me.imsergioh.web.dto.links.DeleteTrafficRequest;
import me.imsergioh.web.dto.links.RecordVisitRequest;
import me.imsergioh.web.dto.links.UpdateLinkRequest;
import me.imsergioh.web.model.LinkItem;
import me.imsergioh.web.model.TrafficItem;
import me.imsergioh.web.util.IpMaskUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.*;

public class LinksServiceTest {

    private LinksService linksService;

    @BeforeEach
    public void setUp() {
        linksService = new LinksService();
        linksService.init();
    }

    @Test
    public void testCreateAndGetLink() {
        CreateLinkRequest req = new CreateLinkRequest("github", "https://github.com/sergiomb04", "GitHub Profile");
        LinkItem created = linksService.createLink(req);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("github", created.getShortId());
        assertEquals("https://github.com/sergiomb04", created.getTargetUrl());
        assertEquals("GitHub Profile", created.getTitle());

        LinkItem fetched = linksService.getLinkByShortId("github");
        assertNotNull(fetched);
        assertEquals(created.getId(), fetched.getId());
    }

    @Test
    public void testCreateDuplicateLinkThrows() {
        CreateLinkRequest req = new CreateLinkRequest("portfolio", "https://imsergioh.me", "Portfolio");
        linksService.createLink(req);

        CreateLinkRequest duplicate = new CreateLinkRequest("PORTFOLIO", "https://imsergioh.me/other", "Duplicate");
        assertThrows(IllegalStateException.class, () -> linksService.createLink(duplicate));
    }

    @Test
    public void testInvalidSlugAndUrl() {
        assertThrows(IllegalArgumentException.class, () ->
                linksService.createLink(new CreateLinkRequest("a", "https://valid.com", "Too short"))
        );
        assertThrows(IllegalArgumentException.class, () ->
                linksService.createLink(new CreateLinkRequest("valid-slug", "not-a-url", "Bad URL"))
        );
    }

    @Test
    public void testUpdateLinkAndCascadeTraffic() {
        CreateLinkRequest req = new CreateLinkRequest("old-slug", "https://example.com", "Initial Title");
        linksService.createLink(req);

        RecordVisitRequest visitReq = new RecordVisitRequest("old-slug", "https://example.com", "157.173.193.125", "JUnit", "");
        linksService.recordVisit(visitReq, null);

        assertEquals(1, linksService.getTraffic("old-slug", 10).size());

        UpdateLinkRequest updateReq = new UpdateLinkRequest("new-slug", "https://updated.com", "Updated Title");
        LinkItem updated = linksService.updateLink("old-slug", updateReq);

        assertEquals("new-slug", updated.getShortId());
        assertEquals("https://updated.com", updated.getTargetUrl());
        assertEquals("Updated Title", updated.getTitle());

        // Traffic should now reflect new-slug
        assertEquals(0, linksService.getTraffic("old-slug", 10).size());
        assertEquals(1, linksService.getTraffic("new-slug", 10).size());
    }

    @Test
    public void testDeleteLinkCascadesTraffic() {
        CreateLinkRequest req = new CreateLinkRequest("to-delete", "https://example.com", "Delete Me");
        linksService.createLink(req);

        RecordVisitRequest visitReq = new RecordVisitRequest("to-delete", "https://example.com", "157.173.193.125", "JUnit", "");
        linksService.recordVisit(visitReq, null);

        assertEquals(1, linksService.getTraffic("to-delete", 10).size());

        linksService.deleteLink("to-delete");

        assertNull(linksService.getLinkByShortId("to-delete"));
        assertEquals(0, linksService.getTraffic("to-delete", 10).size());
    }

    @Test
    public void testRecordVisitAndIpMasking() {
        RecordVisitRequest visitReq = new RecordVisitRequest("masked-test", "https://example.com", "192.168.1.50", "Mozilla/5.0", "https://ref.com");
        TrafficItem item = linksService.recordVisit(visitReq, null);

        assertNotNull(item);
        assertNotNull(item.getId());
        assertEquals("192.168.XX.XX", item.getIpMasked());
        assertEquals("https://ref.com", item.getReferer());
        assertNotNull(item.getOpenedAt());
    }

    @Test
    public void testDeleteTrafficOptions() {
        linksService.recordVisit(new RecordVisitRequest("batch1", "https://example.com", "1.1.1.1", "agent", ""), null);
        linksService.recordVisit(new RecordVisitRequest("batch1", "https://example.com", "1.1.1.2", "agent", ""), null);
        TrafficItem single = linksService.recordVisit(new RecordVisitRequest("batch2", "https://example.com", "1.1.1.3", "agent", ""), null);

        // Delete single
        Map<String, Object> singleResult = linksService.deleteTraffic(new DeleteTrafficRequest(single.getId(), null, null));
        assertEquals("single", singleResult.get("mode"));

        // Delete by shortId
        Map<String, Object> shortIdResult = linksService.deleteTraffic(new DeleteTrafficRequest(null, "batch1", null));
        assertEquals("shortId", shortIdResult.get("mode"));
        assertTrue(((Number) shortIdResult.get("deletedCount")).intValue() >= 2);

        // Delete all
        linksService.recordVisit(new RecordVisitRequest("remaining", "https://example.com", "1.1.1.4", "agent", ""), null);
        Map<String, Object> allResult = linksService.deleteTraffic(new DeleteTrafficRequest(null, null, true));
        assertEquals("all", allResult.get("mode"));
        assertTrue(((Number) allResult.get("deletedCount")).intValue() >= 1);
        assertEquals(0, linksService.getTraffic(null, 10).size());
    }

    @Test
    public void testIpMaskUtils() {
        assertEquals("157.173.XX.XX", IpMaskUtils.maskIp("157.173.193.125"));
        assertEquals("2a01:cb08:XXXX:XXXX", IpMaskUtils.maskIp("2a01:cb08:8b89:9b00:5469:2a77:bc35:710c"));
    }
}
