package no.jens.toilapp.toilet;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ToiletController {

    @GetMapping("/api/toilets")
    public List<Toilet> getToilets() {
        return List.of(
                new Toilet(1L, "Youngstorget public toilet", "Youngstorget, Oslo",
                        59.9140, 10.7522, true, true, false, 4.1),

                new Toilet(2L, "Oslo S restroom", "Jernbanetorget 1, Oslo",
                        59.9111, 10.7503, false, false, true, 3.8),

                new Toilet(3L, "Sofienbergparken toilet", "Sofienbergparken, Oslo",
                        59.9233, 10.7662, true, true, false, 3.5),

                new Toilet(4L, "Aker Brygge restroom", "Aker Brygge, Oslo",
                        59.9101, 10.7276, false, false, true, 4.0),

                new Toilet(5L, "St. Hanshaugen public toilet", "St. Hanshaugen, Oslo",
                        59.9237, 10.7387, true, true, false, 3.7)
        );
    }
}