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
    public List<ToiletResponse> getToilets() {
        return toiletService.getAllToilets()
                .stream()
                .map(ToiletResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ToiletResponse getToiletById(@PathVariable Long id) {
        return toiletService.getToiletById(id)
                .map(ToiletResponse::from)
                .orElseThrow(() -> new ToiletNotFoundException(id));
    }
}