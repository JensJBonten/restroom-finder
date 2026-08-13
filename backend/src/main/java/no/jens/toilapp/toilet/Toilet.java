package no.jens.toilapp.toilet;

import jakarta.persistence.*;

/**
 * Represents one toilet stored by Toilapp and returned by the REST API.
 */

@Entity
@Table(
        name = "toilets",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_toilets_name_address",
                        columnNames = {"name", "address"}
                )
        }
)
public class Toilet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(nullable = false, length = 150)
    private  String name;

    @Column(nullable = false, length = 200)
    private  String address;

    @Column(nullable = false)
    private  double latitude;

    @Column(nullable = false)
    private  double longitude;

    @Column(nullable = false)
    private  boolean free;

    @Column(name = "public_toilet", nullable = false)
    private  boolean publicToilet;

    @Column(name = "requires_entry", nullable = false)
    private  boolean requiresEntry;

    @Column(name = "cleanliness_rating", nullable = false)
    private  double cleanlinessRating;

    /**
     * Required by JPA.
     */

    protected Toilet() {
    }

    /**
     * Creates a new toilet that nhas not yet received a database ID.
     */
    public Toilet(
            String name,
            String address,
            double latitude,
            double longitude,
            boolean free,
            boolean publicToilet,
            boolean requiresEntry,
            double cleanlinessRating
    ) {
        this(
                null,
                name,
                address,
                latitude,
                longitude,
                free,
                publicToilet,
                requiresEntry,
                cleanlinessRating
        );
    }

    /**
     * Creating toilet with a explicit ID.
     *
     * Constructer kept for ecisting tests and application code.
     */

    public Toilet(
            Long id,
            String name,
            String address,
            double latitude,
            double longitude,
            boolean free,
            boolean publicToilet,
            boolean requiresEntry,
            double cleanlinessRating
    ) {
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
