package no.jens.toilapp.toilet;

/**
 * Represents one toilet returned by the Toilapp API.
 *
 * <p>The field names are intentionally exposed through standard JavaBean getters so
 * Spring can serialize them to the JSON names used by the frontend.</p>
 */
public class Toilet {
    private final Long id;
    private final String name;
    private final String address;
    private final double latitude;
    private final double longitude;
    private final boolean free;
    private final boolean publicToilet;
    private final boolean requiresEntry;
    private final double cleanlinessRating;

    public Toilet(Long id, String name, String address, double latitude, double longitude,
                  boolean free, boolean publicToilet, boolean requiresEntry, double cleanlinessRating) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.free = free;
        this.publicToilet = publicToilet;
        this.requiresEntry = requiresEntry;
        this.cleanlinessRating = cleanlinessRating;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public boolean isFree() {
        return free;
    }

    public boolean isPublicToilet() {
        return publicToilet;
    }

    public boolean isRequiresEntry() {
        return requiresEntry;
    }

    public double getCleanlinessRating() {
        return cleanlinessRating;
    }
}
