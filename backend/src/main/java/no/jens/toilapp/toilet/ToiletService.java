package no.jens.toilapp.toilet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ToiletService {

    private final ToiletRepository toiletRepository;

    public ToiletService(ToiletRepository toiletRepository) {
        this.toiletRepository = toiletRepository;
    }

    public List<Toilet> getAllToilets() {
        return toiletRepository.findAllByOrderByIdAsc();
    }

    public Optional<Toilet> getToiletById(long id) {
        return toiletRepository.findById(id);
    }
}