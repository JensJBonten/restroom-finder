package no.jens.toilapp.toilet;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * An imported public toilet.
 *
 * The generated ID identifies the local database row, while source and sourceId
 * identify the corresponding record in the external dataset.
 */

@Entity
@Table(
        name = "toilets",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_toilets_source_source_id",
                        columnNames = {"source", "source_id"}
                )
        }
)

public class Toilet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false, length = 100)
    private String source;

    @Column(name = "source_id", nullable = false, length = 255)
    private String sourceId;

    /**
     * Missing source data is stored as null rather than converted
     * into potentially incorrect default values.
     */
    @Column(length = 255)
    private String name;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(name = "toilet_type", length = 100)
    private String toiletType;

    @Column(name = "accessibility_status", length = 100)
    private String accessibilityStatus;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "source_modified_at")
    private Instant sourceModifiedAt;


    protected Toilet() {
    }

    public Toilet(
            String source,
            String sourceId,
            String name,
            double latitude,
            double longitude,
            String toiletType,
            String accessibilityStatus,
            String comments,
            Instant sourceModifiedAt
    ) {
        this.source = source;
        this.sourceId = sourceId;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.toiletType = toiletType;
        this.accessibilityStatus = accessibilityStatus;
        this.comments = comments;
        this.sourceModifiedAt = sourceModifiedAt;
    }

    /**
     * Updates source-controlled fields without changing either identity.
     */
    public void updateSourceDetails(
            String name,
            double latitude,
            double longitude,
            String toiletType,
            String accessibilityStatus,
            String comments,
            Instant sourceModifiedAt
    ) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.toiletType = toiletType;
        this.accessibilityStatus = accessibilityStatus;
        this.comments = comments;
        this.sourceModifiedAt = sourceModifiedAt;
    }

    public Long getId() {
        return id;
    }

    public String getSource() {
        return source;
    }

    public String getSourceId() {
        return sourceId;
    }

    public String getName() {
        return name;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public String getToiletType() {
        return toiletType;
    }

    public String getAccessibilityStatus() {
        return accessibilityStatus;
    }

    public String getComments() {
        return comments;
    }

    public Instant getSourceModifiedAt() {
        return sourceModifiedAt;
    }
}