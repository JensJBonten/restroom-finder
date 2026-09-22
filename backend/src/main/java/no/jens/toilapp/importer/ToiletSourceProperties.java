package no.jens.toilapp.importer;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Type-safe configuration for fetching toilet data from the external source.
 */
@ConfigurationProperties(prefix = "toilapp.import")
public record ToiletSourceProperties(
        String sourceUrl,
        int pageSize,
        Duration connectTimeout,
        Duration readTimeout,
        boolean enabled
) {
}