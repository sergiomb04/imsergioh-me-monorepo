package me.imsergioh.web.util;

import java.util.Map;
import java.util.stream.Collectors;

public class ActionsUtils {

    public static Map<String, String> getStringMap(Map<String, Object> payload) {
        return payload.entrySet()
                .stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> String.valueOf(e.getValue())
                ));
    }

    public static String getString(Map<String, Object> payload, String key) {
        if (payload.containsKey(key)) return String.valueOf(payload.get(key));
        return null;
    }

}
