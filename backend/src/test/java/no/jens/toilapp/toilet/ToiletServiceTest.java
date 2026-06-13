package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ToiletServiceTest {

    @Test
    void returlAllToilets() {
        ToiletService toiletService = new ToiletService();
        List<Toilet> toilets = toiletService.getAllToilets();
        assertEquals(5, toilets.size());
    }

    @Test
    void returnsToiletById() {
        ToiletService toiletService = new ToiletService();

        Optional<Toilet> toilet = toiletService.getToiletById(1L);

        assertTrue(toilet.isPresent());
        assertEquals("Youngstorget public toilet", toilet.get().getName());
    }

    @Test
    void returnsEmptyWhenToiletDoesNotExist() {
        ToiletService toiletService = new ToiletService();

        Optional<Toilet> toilet = toiletService.getToiletById(999L);

        assertTrue(toilet.isEmpty());
    }
}