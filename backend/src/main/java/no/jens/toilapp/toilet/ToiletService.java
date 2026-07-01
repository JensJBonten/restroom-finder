package no.jens.toilapp.toilet;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Provides temporary in-memory toilet data until database persistence is added.
 */
@Service
public class ToiletService {

    private final List<Toilet> toilets = List.of(
            new Toilet(
                    1L,
                    "Youngstorget public toilet",
                    "Youngstorget, Oslo",
                    59.9140,
                    10.7522,
                    true,
                    true,
                    false,
                    4.1
            ),
            new Toilet(
                    2L,
                    "Oslo S restroom",
                    "Jernbanetorget 1, Oslo",
                    59.9111,
                    10.7503,
                    false,
                    false,
                    true,
                    3.8
            ),
            new Toilet(
                    3L,
                    "Sofienbergparken toilet",
                    "Sofienbergparken, Oslo",
                    59.9233,
                    10.7662,
                    true,
                    true,
                    false,
                    3.5
            ),
            new Toilet(
                    4L,
                    "Aker Brygge restroom",
                    "Aker Brygge, Oslo",
                    59.9101,
                    10.7276,
                    false,
                    false,
                    true,
                    4.0
            ),
            new Toilet(
                    5L,
                    "St. Hanshaugen public toilet",
                    "St. Hanshaugen, Oslo",
                    59.9237,
                    10.7387,
                    true,
                    true,
                    false,
                    3.7
            )
    );

    /**
     * Returns every toilet currently known by the application.
     *
     * @return immutable list of the five sample Oslo toilets
     */
    public List<Toilet> getAllToilets() {
        return toilets;
    }

    /**
     * Looks up a toilet by its unique identifier.
     *
     * @param id toilet identifier from the API path
     * @return matching toilet, or {@link Optional#empty()} when no toilet exists
     */
    public Optional<Toilet> getToiletById(long id) {
        return toilets.stream()
                .filter(toilet -> Objects.equals(toilet.getId(), id))
                .findFirst();
    }
}
