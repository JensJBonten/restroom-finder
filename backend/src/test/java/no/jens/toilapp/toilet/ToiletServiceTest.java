package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ToiletServiceTest {

    private final ToiletService toiletService = new ToiletService();

    @Test
    void returnsAllFiveToilets() {
        List<Toilet> toilets = toiletService.getAllToilets();

        assertEquals(5, toilets.size());
    }

    @Test
    void returnsExpectedToiletData() {
        List<Toilet> toilets = toiletService.getAllToilets();
        Toilet toilet = toilets.getFirst();

        assertEquals(1L, toilet.getId());
        assertEquals("Youngstorget public toilet", toilet.getName());
        assertEquals("Youngstorget, Oslo", toilet.getAddress());
        assertEquals(59.9140, toilet.getLatitude());
        assertEquals(10.7522, toilet.getLongitude());
        assertTrue(toilet.isFree());
        assertTrue(toilet.isPublicToilet());
        assertEquals(4.1, toilet.getCleanlinessRating());
    }

    @Test
    void returnsToiletWhenIdExists() {
        Optional<Toilet> toilet = toiletService.getToiletById(1L);

        assertTrue(toilet.isPresent());
        assertEquals("Youngstorget public toilet", toilet.get().getName());
    }

    @Test
    void returnsEmptyOptionalWhenIdDoesNotExist() {
        Optional<Toilet> toilet = toiletService.getToiletById(999L);

        assertTrue(toilet.isEmpty());
    }
}
