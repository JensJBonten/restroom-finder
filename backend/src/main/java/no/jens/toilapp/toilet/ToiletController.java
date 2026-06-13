package no.jens.toilapp.toilet;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/toilets")
public class ToiletController {

    private final ToiletService toiletService;

    public ToiletController(ToiletService toiletService) {
        this.toiletService = toiletService;
    }

    @GetMapping
    public List<Toilet> getToilets() {
        return toiletService.getAllToilets();
    }

    @GetMapping("/{id}")
    public Toilet getToiletById(@PathVariable Long id) {
        return toiletService.getToiletById(id)
                .orElseThrow(() -> new ToiletNotFoundException(id));
    }
}