package no.jens.toilapp.importer;

import no.jens.toilapp.toilet.Toilet;
import no.jens.toilapp.toilet.ToiletRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Applies a fully fetched and validated source dataset in one transaction.
 */
@Component
public class ToiletImportWriter {

    private final ToiletRepository toiletRepository;

    public ToiletImportWriter(ToiletRepository toiletRepository) {
        this.toiletRepository = toiletRepository;
    }

    @Transactional
    public ToiletImportResult writeToilets(List<Toilet> sourceToilets, int rejectedCount) {
        int createdCount = 0;
        int updatedCount = 0;
        int unchangedCount = 0;

        for (Toilet sourceToilet : sourceToilets) {
            Optional<Toilet> existingToilet = toiletRepository.findBySourceAndSourceId(
                    sourceToilet.getSource(),
                    sourceToilet.getSourceId()
            );

            if (existingToilet.isEmpty()) {
                toiletRepository.save(sourceToilet);
                createdCount++;
                continue;
            }

            if (existingToilet.get().synchronizeSourceDetails(sourceToilet)) {
                updatedCount++;
            } else {
                unchangedCount++;
            }
        }

        toiletRepository.flush();

        return new ToiletImportResult(
                createdCount,
                updatedCount,
                unchangedCount,
                rejectedCount
        );
    }
}