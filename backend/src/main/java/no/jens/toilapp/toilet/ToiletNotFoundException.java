package no.jens.toilapp.toilet;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Signals that a requested toilet ID does not exist.
 *
 * <p>The {@link ResponseStatus} annotation keeps the controller simple by letting
 * Spring convert this exception to HTTP 404.</p>
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ToiletNotFoundException extends RuntimeException {

    /**
     * Creates an exception message for the missing toilet.
     *
     * @param id toilet identifier requested by the client
     */
    public ToiletNotFoundException(Long id) {
        super("Toilet with id " + id + " was not found");
    }
}
