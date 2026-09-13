package no.jens.toilapp.importer;

import no.jens.toilapp.toilet.Toilet;
import no.jens.toilapp.toilet.ToiletRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(ToiletImportWriter.class)
class ToiletImportWriterTest {

    @Autowired
    private ToiletImportWriter importWriter;

    @Autowired
    private ToiletRepository toiletRepository;

    @Test
    void repeatedImportKeepsSameRowAndUpdatesChangedFields() {
        Toilet firstVersion = createToilet("Steinbruvann sør");

        ToiletImportResult firstResult = importWriter.writeToilets(List.of(firstVersion), 0);
        Toilet storedToilet = findStoredToilet();
        Long internalId = storedToilet.getId();

        assertThat(firstResult.created()).isEqualTo(1);
        assertThat(toiletRepository.count()).isEqualTo(1);

        Toilet unchangedVersion = createToilet("Steinbruvann sør");
        ToiletImportResult secondResult = importWriter.writeToilets(List.of(unchangedVersion), 0);

        assertThat(secondResult.unchanged()).isEqualTo(1);
        assertThat(toiletRepository.count()).isEqualTo(1);
        assertThat(findStoredToilet().getId()).isEqualTo(internalId);

        Toilet changedVersion = createToilet("Steinbruvann");
        ToiletImportResult thirdResult = importWriter.writeToilets(List.of(changedVersion), 0);

        assertThat(thirdResult.updated()).isEqualTo(1);
        assertThat(toiletRepository.count()).isEqualTo(1);
        assertThat(findStoredToilet().getId()).isEqualTo(internalId);
        assertThat(findStoredToilet().getName()).isEqualTo("Steinbruvann");
    }

    private Toilet createToilet(String name) {
        return new Toilet(
                "OSLO_KOMMUNE",
                "{C028B6E2-FC18-4206-9DEB-63BCA9B79CEA}",
                name,
                59.972802841816673,
                10.882284318939066,
                "0",
                "NOT_ASSESSED",
                null,
                Instant.parse("2025-12-22T09:43:50Z")
        );
    }

    private Toilet findStoredToilet() {
        return toiletRepository.findBySourceAndSourceId(
                "OSLO_KOMMUNE",
                "{C028B6E2-FC18-4206-9DEB-63BCA9B79CEA}"
        ).orElseThrow();
    }
}