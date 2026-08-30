package me.imsergioh.web.analytics;

import me.imsergioh.web.analytics.model.CountryStats;
import me.imsergioh.web.analytics.model.SessionEvent;
import me.imsergioh.web.analytics.model.SessionState;
import me.imsergioh.web.analytics.model.TimeBucketStats;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class AnalyticsDiscardFilterTest {

    @Test
    public void testDiscardableSession_ShortThreeEventsRootPage() {
        long startedAt = 1000L;
        SessionState state = new SessionState("sess-1", "127.0.0.1", "Spain", "ES", startedAt, 250);
        state.addEvent(new SessionEvent("SESSION_START", 1000L, null, Map.of()));
        state.addEvent(new SessionEvent("PAGE_VIEW", 1001L, "/", Map.of()));
        state.addEvent(new SessionEvent("SESSION_END", 1003L, null, Map.of()));

        long endedAt = 1003L; // 3 seconds duration
        assertTrue(AnalyticsState.isDiscardableSession(state, endedAt));
    }

    @Test
    public void testDiscardableSession_ShortThreeEventsRootPageEmptyPath() {
        long startedAt = 1000L;
        SessionState state = new SessionState("sess-empty-path", "127.0.0.1", "Spain", "ES", startedAt, 250);
        state.addEvent(new SessionEvent("SESSION_START", 1000L, null, Map.of()));
        state.addEvent(new SessionEvent("PAGE_VIEW", 1001L, "", Map.of()));
        state.addEvent(new SessionEvent("SESSION_END", 1002L, null, Map.of()));

        long endedAt = 1002L; // 2 seconds duration
        assertTrue(AnalyticsState.isDiscardableSession(state, endedAt));
    }

    @Test
    public void testNotDiscardable_DurationSixSecondsOrMore() {
        long startedAt = 1000L;
        SessionState state = new SessionState("sess-2", "127.0.0.1", "Spain", "ES", startedAt, 250);
        state.addEvent(new SessionEvent("SESSION_START", 1000L, null, Map.of()));
        state.addEvent(new SessionEvent("PAGE_VIEW", 1002L, "/", Map.of()));
        state.addEvent(new SessionEvent("SESSION_END", 1006L, null, Map.of()));

        long endedAt = 1006L; // 6 seconds duration
        assertFalse(AnalyticsState.isDiscardableSession(state, endedAt));

        long endedAtLonger = 1020L; // 20 seconds
        assertFalse(AnalyticsState.isDiscardableSession(state, endedAtLonger));
    }

    @Test
    public void testNotDiscardable_MoreThanThreeEvents() {
        long startedAt = 1000L;
        SessionState state = new SessionState("sess-3", "127.0.0.1", "Spain", "ES", startedAt, 250);
        state.addEvent(new SessionEvent("SESSION_START", 1000L, null, Map.of()));
        state.addEvent(new SessionEvent("PAGE_VIEW", 1001L, "/", Map.of()));
        state.addEvent(new SessionEvent("LINK_CLICK", 1002L, "/about", Map.of()));
        state.addEvent(new SessionEvent("SESSION_END", 1003L, null, Map.of()));

        long endedAt = 1003L; // 3 seconds duration, but 4 events
        assertFalse(AnalyticsState.isDiscardableSession(state, endedAt));
    }

    @Test
    public void testNotDiscardable_NonRootPageView() {
        long startedAt = 1000L;
        SessionState state = new SessionState("sess-4", "127.0.0.1", "Spain", "ES", startedAt, 250);
        state.addEvent(new SessionEvent("SESSION_START", 1000L, null, Map.of()));
        state.addEvent(new SessionEvent("PAGE_VIEW", 1001L, "/projects", Map.of()));
        state.addEvent(new SessionEvent("SESSION_END", 1003L, null, Map.of()));

        long endedAt = 1003L; // 3 seconds duration, but path is /projects
        assertFalse(AnalyticsState.isDiscardableSession(state, endedAt));
    }

    @Test
    public void testCountryStatsDecrement() {
        CountryStats cs = new CountryStats();
        cs.incrementSession();
        cs.incrementEventType("SESSION_START");
        cs.incrementEventType("PAGE_VIEW");
        cs.incrementEventType("SESSION_END");

        assertEquals(1, cs.getSessions());
        assertEquals(3, cs.getEvents());
        assertEquals(1, cs.getPageViews());

        cs.decrementSession();
        cs.decrementEventType("SESSION_START");
        cs.decrementEventType("PAGE_VIEW");
        cs.decrementEventType("SESSION_END");

        assertEquals(0, cs.getSessions());
        assertEquals(0, cs.getEvents());
        assertEquals(0, cs.getPageViews());
    }

    @Test
    public void testTimeBucketStatsDecrement() {
        TimeBucketStats tbs = new TimeBucketStats();
        tbs.increment("PAGE_VIEW");
        tbs.increment("SESSION_START");

        assertEquals(2, tbs.getTotal());
        assertEquals(1, tbs.getPageViews());
        assertEquals(1L, tbs.getDistribution().get("PAGE_VIEW"));

        tbs.decrement("PAGE_VIEW");
        assertEquals(1, tbs.getTotal());
        assertEquals(0, tbs.getPageViews());
        assertNull(tbs.getDistribution().get("PAGE_VIEW"));
    }
}
