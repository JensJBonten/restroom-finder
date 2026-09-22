package no.jens.toilapp.importer;

import com.fasterxml.jackson.databind.JsonNode;
import no.jens.toilapp.toilet.Toilet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ToiletImportService {

    private static final Logger logger = LoggerFactory.getLogger(ToiletImportService.class);

    private final ToiletSourceClient sourceClient;
    private final ToiletSourceMapper sourceMapper;
    private final ToiletImportWriter importWriter;

    public ToiletImportService(
            ToiletSourceClient sourceClient,
            ToiletSourceMapper sourceMapper,
            ToiletImportWriter importWriter
    ) {
        this.sourceClient = sourceClient;
        this.sourceMapper = sourceMapper;
        this.importWriter = importWriter;
    }

    public ToiletImportResult importToilets() {
        try {
            List<JsonNode> toiletFeatures = sourceClient.fetchAllToiletFeatures();
            List<Toilet> mappedToilets = new ArrayList<>();
            Set<String> sourceIdentifiers = new HashSet<>();
            int rejectedCount = 0;

            // Fetching and mapping finish before the transactional database write begins.
            for (JsonNode toiletFeature : toiletFeatures) {
                var mappedToilet = sourceMapper.mapToiletFeature(toiletFeature);

                if (mappedToilet.isEmpty()) {
                    rejectedCount++;
                    continue;
                }

                Toilet toilet = mappedToilet.get();
                String sourceIdentifier = toilet.getSource() + ":" + toilet.getSourceId();

                if (!sourceIdentifiers.add(sourceIdentifier)) {
                    throw new ToiletSourceException(
                            "Source returned duplicate identifier: " + sourceIdentifier
                    );
                }

                mappedToilets.add(toilet);
            }

            if (mappedToilets.isEmpty()) {
                throw new ToiletSourceException(
                        "Source did not contain any valid toilet records"
                );
            }

            ToiletImportResult result = importWriter.writeToilets(mappedToilets, rejectedCount);

            logger.info(
                    "Toilet import completed: created={}, updated={}, unchanged={}, rejected={}",
                    result.created(),
                    result.updated(),
                    result.unchanged(),
                    result.rejected()
            );

            return result;
        } catch (RuntimeException exception) {
            logger.error("Toilet import failed. Existing data was preserved.", exception);
            throw exception;
        }
    }
}