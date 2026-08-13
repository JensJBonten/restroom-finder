package no.jens.toilapp.toilet;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Adds the initial Oslo toilet dataset when the records do not already exist.
 */

@Component
public class ToiletDataSeeder implements ApplicationRunner {

    private static final List<SeedToilet> SEED_TOILETS = List.of(
            new SeedToilet(
                    "Youngstorget public toilet",
                    "Youngstorget, Oslo",
                    59.9140,
                    10.7522,
                    true,
                    true,
                    false,
                    4.1
            ),
            new SeedToilet(
                    "Oslo S restroom",
                    "Jernbanetorget 1, Oslo",
                    59.9111,
                    10.7503,
                    false,
                    false,
                    true,
                    3.8
            ),
            new SeedToilet(
                    "Sofienbergparken toilet",
                    "Sofienbergparken, Oslo",
                    59.9233,
                    10.7662,
                    true,
                    true,
                    false,
                    3.5
            ),
            new SeedToilet(
                    "Aker Brygge restroom",
                    "Aker Brygge, Oslo",
                    59.9101,
                    10.7276,
                    false,
                    false,
                    true,
                    4.0
            ),
            new SeedToilet(
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

    private final ToiletRepository toiletRepository;

    public ToiletDataSeeder(ToiletRepository toiletRepository) {
    this.toiletRepository = toiletRepository;
    }
    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Toilet> missingToilets = SEED_TOILETS.stream()
                .filter(seedToilet -> !toiletRepository.existsByNameAndAddress(
                        seedToilet.name(),
                        seedToilet.address()
                ))
                .map(SeedToilet::toEntity)
                .toList();

        if (!missingToilets.isEmpty()) {
            toiletRepository.saveAll(missingToilets);
        }
    }

    private record SeedToilet(
            String name,
            String address,
            double latitude,
            double longitude,
            boolean free,
            boolean publicToilet,
            boolean requiresEntry,
            double cleanlinessRating
    ) {

        private Toilet toEntity() {
            return new Toilet(
                    name,
                    address,
                    latitude,
                    longitude,
                    free,
                    publicToilet,
                    requiresEntry,
                    cleanlinessRating
            );
        }
    }
}