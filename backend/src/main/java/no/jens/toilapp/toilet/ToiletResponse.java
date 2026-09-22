package no.jens.toilapp.toilet;

import java.time.Instant;

/**
 * Defines the toilet data exposed by the public REST API
 */

public record ToiletResponse(
        Long id,
        String source,
        String name,
        double latitude,
        double longitude,
        String toiletType,
        String accessibilityStatus,
        String comments,
        Instant sourceModifiedAt
) {

    public static ToiletResponse from (Toilet toilet) {
        return new ToiletResponse(
                toilet.getId(),
                toilet.getSource(),
                toilet.getName(),
                toilet.getLatitude(),
                toilet.getLongitude(),
                toilet.getToiletType(),
                toilet.getAccessibilityStatus(),
                toilet.getComments(),
                toilet.getSourceModifiedAt()
        );
    }
}