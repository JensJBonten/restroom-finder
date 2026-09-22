package no.jens.toilapp.toilet;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Spring turns this exception into HTTP 404 through the annotation.
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ToiletNotFoundException extends RuntimeException {

    public ToiletNotFoundException(Long id) {
        super("Toilet with id " + id + " was not found");
    }
}
