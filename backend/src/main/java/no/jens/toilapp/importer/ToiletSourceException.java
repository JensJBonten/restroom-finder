package no.jens.toilapp.importer;

public class ToiletSourceException extends RuntimeException {

    public ToiletSourceException(String message) {
        super(message);
    }

    public ToiletSourceException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}