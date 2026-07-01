package no.jens.toilapp.toilet;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes REST endpoints used by Toilapp frontend.
 *
 * <p>The current CORS configuration allows the two local Vite ports used during development.
 * This will later be moved to environment-based configuration before deployments. </p>
 *
 */

@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})

@RestController
@RequestMapping("/api/toilets")
public class ToiletController {

    private final ToiletService toiletService;

    public ToiletController(ToiletService toiletService) {
        this.toiletService = toiletService;
    }

    /**
     * Returns all toilets cuirrently available in the application.
     * @return all registered toilets.
     */

    @GetMapping
    public List<Toilet> getToilets() {
        return toiletService.getAllToilets();
    }

    /**
     * Returns one toilet based on its unique identifier.
     *
     * @param id the toilet identifier
     * @return the matching toilet
     * @throws ToiletNotFoundException when the toilet does not exist
     */

    @GetMapping("/{id}")
    public Toilet getToiletById(@PathVariable Long id) {
        return toiletService.getToiletById(id)
                .orElseThrow(() -> new ToiletNotFoundException(id));
    }
}