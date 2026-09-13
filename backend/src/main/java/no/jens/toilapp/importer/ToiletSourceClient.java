package no.jens.toilapp.importer;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Component
public class ToiletSourceClient {

    private static final String QUERY_PATH = "/query";
    private static final String WHERE_ALL = "1=1";

    private final ToiletSourceProperties properties;
    private final RestClient restClient;

    public ToiletSourceClient(ToiletSourceProperties properties, RestClient restClient) {
        this.properties = properties;
        this.restClient = restClient;
    }

    public List<JsonNode> fetchAllToiletFeatures() {
        // Fetch the count first so we can check that all pages were received.
        int expectedRecordCount = fetchExpectedRecordCount();
        if (expectedRecordCount <= 0) {
            throw new ToiletSourceException(
                    "Source returned an unexpected record count: " + expectedRecordCount
            );
        }

        List<JsonNode> toiletFeatures = new ArrayList<>(expectedRecordCount);

        for (int offset = 0; offset < expectedRecordCount; offset += properties.pageSize()) {
            List<JsonNode> featurePage = fetchToiletFeaturePage(offset);
            if (featurePage.isEmpty()) {
                throw new ToiletSourceException(
                        "Source returned an empty page at offset " + offset
                );
            }
            toiletFeatures.addAll(featurePage);
        }

        // Stop an incomplete fetch before any records reach the database writer.
        if (toiletFeatures.size() != expectedRecordCount) {
            throw new ToiletSourceException("Expected " + expectedRecordCount + " records, but received " +
                    toiletFeatures.size());
        }

        return List.copyOf(toiletFeatures);
    }

    private int fetchExpectedRecordCount() {
        URI requestUri = UriComponentsBuilder
                .fromUriString(properties.sourceUrl() + QUERY_PATH)
                .queryParam("where", WHERE_ALL)
                .queryParam("returnCountOnly", true)
                .queryParam("f", "json")
                .build()
                .encode()
                .toUri();

        JsonNode sourceResponse = request(requestUri);
        validateArcGisResponse(sourceResponse);

        JsonNode recordCount = sourceResponse.get("count");

        if (recordCount == null || !recordCount.canConvertToInt()) {
            throw new ToiletSourceException(
                    "Source response did not contain a valid record count"
            );
        }

        return recordCount.intValue();
    }

    private List<JsonNode> fetchToiletFeaturePage(int offset) {
        URI requestUri = UriComponentsBuilder
                .fromUriString(properties.sourceUrl() + QUERY_PATH)
                .queryParam("where", WHERE_ALL)
                .queryParam("outFields", "*")
                .queryParam("returnGeometry", true)
                .queryParam("outSR", 4326)
                .queryParam("orderByFields", "objectid ASC")
                .queryParam("resultOffset", offset)
                .queryParam("resultRecordCount", properties.pageSize())
                .queryParam("f", "geojson")
                .build()
                .encode()
                .toUri();

        JsonNode sourceResponse = request(requestUri);
        validateArcGisResponse(sourceResponse);

        JsonNode featuresNode = sourceResponse.get("features");

        if (featuresNode == null || !featuresNode.isArray()) {
            throw new ToiletSourceException(
                    "Source response did not contain a features array"
            );
        }

        List<JsonNode> toiletFeatures = new ArrayList<>();
        featuresNode.forEach(toiletFeatures::add);

        return toiletFeatures;
    }

    private JsonNode request(URI requestUri) {
        try {
            JsonNode sourceResponse = restClient.get().uri(requestUri).retrieve().body(JsonNode.class);
            if (sourceResponse == null) {
                throw new ToiletSourceException("Source returned an empty response");
            }
            return sourceResponse;

        } catch (RestClientException exception) {
            throw new ToiletSourceException("Unable to fetch or parse toilet source data", exception);
        }
    }

    private void validateArcGisResponse(JsonNode sourceResponse) {
        // ArcGIS can return an error body with HTTP status 200.
        JsonNode error = sourceResponse.get("error");

        if (error != null && !error.isNull()) {
            throw new ToiletSourceException("ArcGIS returned an error: " + error);
        }
    }
}