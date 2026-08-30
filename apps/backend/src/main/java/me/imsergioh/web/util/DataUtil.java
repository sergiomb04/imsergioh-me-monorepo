package me.imsergioh.web.util;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CountryResponse;
import com.maxmind.geoip2.record.Country;

import java.io.File;
import java.net.InetAddress;

public class DataUtil {

    private static DatabaseReader dbReader;

    static {
        try {
            String geoDbPath = System.getenv("GEOIP_DB_PATH");
            if (geoDbPath == null || geoDbPath.isBlank()) {
                geoDbPath = System.getProperty("GEOIP_DB_PATH");
            }
            File dbFile = (geoDbPath != null && !geoDbPath.isBlank())
                    ? new File(geoDbPath)
                    : new File("data/GeoLite2-Country.mmdb");

            if (dbFile.exists()) {
                dbReader = new DatabaseReader.Builder(dbFile).build();
                System.out.println("🌍 GeoIP database loaded from: " + dbFile.getAbsolutePath());
            } else {
                System.out.println("⚠️ GeoLite2 database not found at " + dbFile.getAbsolutePath() + ". GeoIP resolution will be skipped.");
                dbReader = null;
            }
        } catch (Exception e) {
            System.err.println("⚠️ Warning: Could not initialize GeoIP DatabaseReader: " + e.getMessage());
            dbReader = null;
        }
    }

    public static Country getCountry(String ip) {
        if (dbReader == null || ip == null || ip.isBlank()) {
            return null;
        }
        try {
            InetAddress ipAddress = InetAddress.getByName(ip.trim());
            CountryResponse response = dbReader.country(ipAddress);
            return response != null ? response.getCountry() : null;
        } catch (Exception e) {
            return null;
        }
    }
}
