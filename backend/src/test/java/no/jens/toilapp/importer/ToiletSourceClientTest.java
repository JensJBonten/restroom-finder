package no.jens.toilapp.importer;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ToiletSourceClientTest {

    private MockRestServiceServer mockServer;
    private ToiletSourceClient sourceClient;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();

        ToiletSourceProperties properties = new ToiletSourceProperties(
                "http://toilet-source.test",
                50,
                Duration.ofSeconds(5),
                Duration.ofSeconds(20),
                false
        );

        sourceClient = new ToiletSourceClient(properties, restClientBuilder.build());
    }

    @Test
    void fetchesCompleteToiletDataset() {
        mockServer.expect(request -> assertThat(request.getURI().getQuery())
                        .contains("returnCountOnly=true"))
                .andRespond(withSuccess("""
                        {
                          "count": 2
                        }
                        """, MediaType.APPLICATION_JSON));

        mockServer.expect(request -> assertThat(request.getURI().getQuery())
                        .contains("resultOffset=0", "resultRecordCount=50"))
                .andRespond(withSuccess("""
                        {
                          "type": "FeatureCollection",
                          "features": [
                            {
                              "properties": {
                                "globalid": "{first-id}"
                              }
                            },
                            {
                              "properties": {
                                "globalid": "{second-id}"
                              }
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        List<JsonNode> toiletFeatures = sourceClient.fetchAllToiletFeatures();

        assertThat(toiletFeatures).hasSize(2);
        assertThat(toiletFeatures.getFirst().path("properties").path("globalid").asText())
                .isEqualTo("{first-id}");

        mockServer.verify();
    }

    @Test
    void rejectsIncompleteDataset() {
        mockServer.expect(request -> assertThat(request.getURI().getQuery())
                        .contains("returnCountOnly=true"))
                .andRespond(withSuccess("""
                        {
                          "count": 2
                        }
                        """, MediaType.APPLICATION_JSON));

        mockServer.expect(request -> assertThat(request.getURI().getQuery())
                        .contains("resultOffset=0"))
                .andRespond(withSuccess("""
                        {
                          "type": "FeatureCollection",
                          "features": [
                            {
                              "properties": {
                                "globalid": "{only-id}"
                              }
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(sourceClient::fetchAllToiletFeatures)
                .isInstanceOf(ToiletSourceException.class)
                .hasMessageContaining("Expected 2 records, but received 1");

        mockServer.verify();
    }

    @Test
    void detectsArcGisErrorReturnedWithHttpOk() {
        mockServer.expect(request -> assertThat(request.getURI().getQuery())
                        .contains("returnCountOnly=true"))
                .andRespond(withSuccess("""
                        {
                          "error": {
                            "code": 500,
                            "message": "Source unavailable"
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(sourceClient::fetchAllToiletFeatures)
                .isInstanceOf(ToiletSourceException.class)
                .hasMessageContaining("ArcGIS returned an error");

        mockServer.verify();
    }
}