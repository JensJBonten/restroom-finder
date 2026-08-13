package no.jens.toilapp.toilet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Provides temporary in-memory toilet data until database persistence is added.
 */

@Service
@Transactional
public class ToiletService {

    private final ToiletRepository toiletRepository;

    public ToiletService(ToiletRepository toiletRepository) {
        this.toiletRepository = toiletRepository;
    }

    /**
     * Returns every toilet ordered by database ID
     */
    public List<Toilet> getAllToilets() {
        return toiletRepository.findAllByOrderByIdAsc();
    }

    /**
     * Looks up a toilet by its unique database identifier.
     */
    public Optional<Toilet> getToiletById(long id) {
        return toiletRepository.findById(id);
    }
}