package no.jens.toilapp.importer;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Configures the HTTP client used to fetch toilet data from Oslo municipality.
 */
@Configuration
public class ToiletSourceHttpConfiguration {

    @Bean
    public RestClient toiletSourceRestClient(
            ToiletSourceProperties properties,
            RestClient.Builder restClientBuilder
    ) {
        // Timeouts prevent an unavailable source from blocking the import indefinitely.
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.connectTimeout());
        requestFactory.setReadTimeout(properties.readTimeout());

        return restClientBuilder
                .requestFactory(requestFactory)
                .build();
    }
}