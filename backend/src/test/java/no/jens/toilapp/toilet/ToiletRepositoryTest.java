package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest(showSql = false)
class ToiletRepositoryTest {

    @Autowired
    private ToiletRepository toiletRepository;

    @Test
    void savesAndReadsToilet() {
        Toilet toilet = new Toilet(
                "Test toilet",
                "Testveien 1, Oslo",
                59.9100,
                10.7500,
                true,
                true,
                false,
                4.5
        );

        Toilet savedToilet = toiletRepository.saveAndFlush(toilet);

        assertNotNull(savedToilet.getId());

        Toilet storedToilet = toiletRepository.findById(savedToilet.getId())
                .orElseThrow();

        assertEquals("Test toilet", storedToilet.getName());
        assertEquals("Testveien 1, Oslo", storedToilet.getAddress());
        assertEquals(59.9100, storedToilet.getLatitude());
        assertEquals(10.7500, storedToilet.getLongitude());
        assertTrue(storedToilet.isFree());
        assertTrue(storedToilet.isPublicToilet());
        assertEquals(4.5, storedToilet.getCleanlinessRating());
    }

    @Test
    void returnsToiletsOrderedById() {
        Toilet firstToilet = toiletRepository.saveAndFlush(
                new Toilet(
                        "First toilet",
                        "Førsteveien 1, Oslo",
                        59.9100,
                        10.7500,
                        true,
                        true,
                        false,
                        4.0
                )
        );

        Toilet secondToilet = toiletRepository.saveAndFlush(
                new Toilet(
                        "Second toilet",
                        "Andreveien 2, Oslo",
                        59.9200,
                        10.7600,
                        false,
                        false,
                        true,
                        3.0
                )
        );

        List<Toilet> toilets = toiletRepository.findAllByOrderByIdAsc();

        assertEquals(2, toilets.size());
        assertEquals(firstToilet.getId(), toilets.get(0).getId());
        assertEquals(secondToilet.getId(), toilets.get(1).getId());
    }

    @Test
    void detectsExistingNameAndAddress() {
        toiletRepository.saveAndFlush(
                new Toilet(
                        "Existing toilet",
                        "Eksisterende gate 3, Oslo",
                        59.9300,
                        10.7700,
                        true,
                        true,
                        false,
                        4.2
                )
        );

        boolean exists = toiletRepository.existsByNameAndAddress(
                "Existing toilet",
                "Eksisterende gate 3, Oslo"
        );

        assertTrue(exists);
    }
}