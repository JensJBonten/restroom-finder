package no.jens.toilapp.importer;

import com.fasterxml.jackson.databind.JsonNode;
import no.jens.toilapp.toilet.Toilet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class ToiletSourceMapper {

    private static final Logger logger = LoggerFactory.getLogger(ToiletSourceMapper.class);
    private static final String SOURCE = "OSLO_KOMMUNE";

    public Optional<Toilet> mapToiletFeature(JsonNode toiletFeature) {
        JsonNode properties = toiletFeature.path("properties");
        JsonNode coordinates = toiletFeature.path("geometry").path("coordinates");

        String sourceId = readNullableText(properties.get("globalid"));

        if (sourceId == null) {
            return rejectFeature(toiletFeature, "missing globalid");
        }

        if (!hasValidCoordinates(coordinates)) {
            return rejectFeature(toiletFeature, "missing or invalid coordinates");
        }

        // GeoJSON coordinates are ordered as longitude followed by latitude.
        double longitude = coordinates.get(0).doubleValue();
        double latitude = coordinates.get(1).doubleValue();

        Toilet toilet = new Toilet(
                SOURCE,
                sourceId,
                readNullableText(properties.get("navn")),
                latitude,
                longitude,
                readToiletType(properties.get("toalettype")),
                mapAccessibilityStatus(properties.get("tilgjengelighetsvurdering")),
                readNullableText(properties.get("kommentar")),
                readNullableInstant(properties.get("last_edited_date"))
        );

        return Optional.of(toilet);
    }

    private boolean hasValidCoordinates(JsonNode coordinates) {
        if (!coordinates.isArray() || coordinates.size() < 2
                || !coordinates.get(0).isNumber() || !coordinates.get(1).isNumber()) {
            return false;
        }

        double longitude = coordinates.get(0).doubleValue();
        double latitude = coordinates.get(1).doubleValue();

        return longitude >= -180 && longitude <= 180
                && latitude >= -90 && latitude <= 90;
    }

    private String readNullableText(JsonNode value) {
        if (value == null || value.isNull()) {
            return null;
        }

        String text = value.asText().trim();
        return text.isEmpty() ? null : text;
    }

    private String readToiletType(JsonNode value) {
        if (value == null || value.isNull()) {
            return null;
        }

        // The source metadata for this field is inconsistent, so its raw code is preserved.
        return value.asText();
    }

    private String mapAccessibilityStatus(JsonNode value) {
        if (value == null || value.isNull()) {
            return null;
        }

        return switch (value.asInt(-1)) {
            case 1 -> "ACCESSIBLE";
            case 2 -> "DIFFICULT_ACCESS";
            case 3 -> "NOT_ACCESSIBLE";
            case 4 -> "NOT_ASSESSED";
            default -> {
                logger.warn("Unknown accessibility code received from source: {}", value);
                yield null;
            }
        };
    }

    private Instant readNullableInstant(JsonNode value) {
        if (value == null || value.isNull() || !value.canConvertToLong()) {
            return null;
        }

        return Instant.ofEpochMilli(value.longValue());
    }

    private Optional<Toilet> rejectFeature(JsonNode toiletFeature, String reason) {
        String objectId = toiletFeature.path("properties").path("objectid").asText("unknown");
        logger.warn("Rejected source toilet with objectid={}: {}", objectId, reason);
        return Optional.empty();
    }
}