package no.jens.toilapp.toilet;

public class Toilet {
    private Long id;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private boolean free;
    private boolean publicToilet;
    private boolean requiresEntry;
    private double cleanlinessRating;

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