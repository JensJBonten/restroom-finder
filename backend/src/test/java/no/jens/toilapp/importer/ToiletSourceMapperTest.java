package no.jens.toilapp.importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import no.jens.toilapp.toilet.Toilet;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ToiletSourceMapperTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ToiletSourceMapper mapper = new ToiletSourceMapper();

    @Test
    void mapsValidOsloFeature() throws Exception {
        JsonNode toiletFeature = objectMapper.readTree("""
                {
                  "geometry": {
                    "type": "Point",
                    "coordinates": [10.882284318939066, 59.972802841816673]
                  },
                  "properties": {
                    "objectid": 1,
                    "globalid": "{C028B6E2-FC18-4206-9DEB-63BCA9B79CEA}",
                    "navn": "Steinbruvann sør",
                    "toalettype": 0,
                    "tilgjengelighetsvurdering": 4,
                    "kommentar": null,
                    "last_edited_date": 1766396630000
                  }
                }
                """);

        Optional<Toilet> result = mapper.mapToiletFeature(toiletFeature);

        assertThat(result).isPresent();

        Toilet toilet = result.orElseThrow();
        assertThat(toilet.getSource()).isEqualTo("OSLO_KOMMUNE");
        assertThat(toilet.getSourceId()).isEqualTo("{C028B6E2-FC18-4206-9DEB-63BCA9B79CEA}");
        assertThat(toilet.getName()).isEqualTo("Steinbruvann sør");
        assertThat(toilet.getLongitude()).isEqualTo(10.882284318939066);
        assertThat(toilet.getLatitude()).isEqualTo(59.972802841816673);
        assertThat(toilet.getToiletType()).isEqualTo("0");
        assertThat(toilet.getAccessibilityStatus()).isEqualTo("NOT_ASSESSED");
        assertThat(toilet.getComments()).isNull();
        assertThat(toilet.getSourceModifiedAt()).isEqualTo("2025-12-22T09:43:50Z");
    }

    @Test
    void rejectsFeatureWithoutGlobalId() throws Exception {
        JsonNode toiletFeature = objectMapper.readTree("""
                {
                  "geometry": {
                    "coordinates": [10.75, 59.91]
                  },
                  "properties": {
                    "objectid": 2,
                    "navn": "Missing ID"
                  }
                }
                """);

        assertThat(mapper.mapToiletFeature(toiletFeature)).isEmpty();
    }

    @Test
    void rejectsFeatureWithInvalidCoordinates() throws Exception {
        JsonNode toiletFeature = objectMapper.readTree("""
                {
                  "geometry": {
                    "coordinates": [200, 95]
                  },
                  "properties": {
                    "objectid": 3,
                    "globalid": "{test-id}"
                  }
                }
                """);

        assertThat(mapper.mapToiletFeature(toiletFeature)).isEmpty();
    }

    @Test
    void preservesMissingOptionalValuesAsNull() throws Exception {
        JsonNode toiletFeature = objectMapper.readTree("""
                {
                  "geometry": {
                    "coordinates": [10.75, 59.91]
                  },
                  "properties": {
                    "objectid": 4,
                    "globalid": "{test-id}",
                    "navn": null,
                    "toalettype": null,
                    "tilgjengelighetsvurdering": null,
                    "kommentar": null
                  }
                }
                """);

        Toilet toilet = mapper.mapToiletFeature(toiletFeature).orElseThrow();

        assertThat(toilet.getName()).isNull();
        assertThat(toilet.getToiletType()).isNull();
        assertThat(toilet.getAccessibilityStatus()).isNull();
        assertThat(toilet.getComments()).isNull();
        assertThat(toilet.getSourceModifiedAt()).isNull();
    }
}