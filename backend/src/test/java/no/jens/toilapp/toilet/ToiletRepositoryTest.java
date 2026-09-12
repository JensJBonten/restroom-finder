package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ToiletRepositoryTest {

    @Autowired
    private ToiletRepository toiletRepository;

    @Test
    void findsToiletBySourceAndSourceId() {
        Toilet toilet = new Toilet(
                "OSLO_KOMMUNE",
                "test-global-id",
                "Youngstorget",
                59.9142,
                10.7494,
                "PUBLIC_TOILET",
                null,
                "Test record",
                Instant.parse("2026-09-12T06:00:00Z")
        );

        toiletRepository.save(toilet);

        Toilet savedToilet = toiletRepository
                .findBySourceAndSourceId("OSLO_KOMMUNE", "test-global-id")
                .orElseThrow();

        assertThat(savedToilet.getId()).isNotNull();
        assertThat(savedToilet.getName()).isEqualTo("Youngstorget");
        assertThat(savedToilet.getAccessibilityStatus()).isNull();
    }

    @Test
    void returnsEmptyWhenSourceRecordDoesNotExist() {
        assertThat(
                toiletRepository.findBySourceAndSourceId(
                        "OSLO_KOMMUNE",
                        "unknown-id"
                )
        ).isEmpty();
    }
}