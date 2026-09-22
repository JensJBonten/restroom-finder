package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ToiletServiceTest {

    @Mock
    private ToiletRepository toiletRepository;

    @InjectMocks
    private ToiletService toiletService;

    private final Toilet youngstorgetToilet = new Toilet(
            "OSLO_KOMMUNE",
            "test-global-id",
            "Youngstorget",
            59.9140,
            10.7522,
            "PUBLIC_TOILET",
            null,
            "Test record",
            Instant.parse("2026-09-12T06:00:00Z")
    );

    @Test
    void returnsAllToiletsInRepositoryOrder() {
        when(toiletRepository.findAllByOrderByIdAsc())
                .thenReturn(List.of(youngstorgetToilet));

        List<Toilet> toilets = toiletService.getAllToilets();

        assertEquals(1, toilets.size());
        assertEquals("Youngstorget", toilets.getFirst().getName());

        verify(toiletRepository).findAllByOrderByIdAsc();
    }

    @Test
    void returnsToiletWhenIdExists() {
        when(toiletRepository.findById(1L))
                .thenReturn(Optional.of(youngstorgetToilet));

        Optional<Toilet> toilet = toiletService.getToiletById(1L);

        assertTrue(toilet.isPresent());
        assertEquals("Youngstorget", toilet.get().getName());

        verify(toiletRepository).findById(1L);
    }

    @Test
    void returnsEmptyWhenIdDoesNotExist() {
        when(toiletRepository.findById(999L))
                .thenReturn(Optional.empty());

        Optional<Toilet> toilet = toiletService.getToiletById(999L);

        assertTrue(toilet.isEmpty());

        verify(toiletRepository).findById(999L);
    }
}