package no.jens.toilapp.toilet;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ToiletRepository extends JpaRepository<Toilet, Long> {

    List<Toilet> findAllByOrderByIdAsc();

    Optional<Toilet> findBySourceAndSourceId(
            String source,
            String sourceId
    );
}