# Data source: public toilets in Oslo

## Source and import status

**Publisher:** Bymiljøetaten, Oslo kommune (Oslo municipality's Agency for Urban Environment).

**Dataset:** Offentlige toaletter.

- [ArcGIS toilet layer](https://geodata.bymoslo.no/arcgis/rest/services/geodata/Temadata_Publikum/MapServer/4)
- [GeoJSON query in WGS84](https://geodata.bymoslo.no/arcgis/rest/services/geodata/Temadata_Publikum/MapServer/4/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=4326)

**Licence:** Norsk lisens for offentlige data (NLOD). Credit: Bymiljøetaten, Oslo kommune.

**82 toilets were imported successfully on 13 September 2026.** This is a dated import result, not a promise that the source will always contain 82 records. Refresh is manual and is not scheduled.

## Why this source?

The municipality's dataset covers public toilets in Oslo and supplies source identifiers and geographical coordinates. It gives this Oslo-focused application a practical starting point without inventing information the source does not contain.

The reviewed extract had coordinates and global IDs for all records, but one toilet lacked a name. Some practical information was available only in comments. The interface shows the information imported by the current model and does not infer opening hours or live availability.

## Field mapping

| Source field | Backend representation | Current interface and missing-value handling |
| --- | --- | --- |
| `globalid` | `sourceId`, paired with `source = OSLO_KOMMUNE` | Used for import identity, not displayed. A missing or blank ID rejects the record. |
| GeoJSON coordinates | `longitude`, `latitude` | Used for map markers, distance and navigation. Missing, nonnumeric or out-of-range coordinates reject the record. |
| `navn` | `name` | Displayed in the map, list and details. Missing or blank text is stored as null and displayed as “Offentlig toalett”. |
| `toalettype` | `toiletType` | Raw source code is stored and included in the API, but hidden by the current UI because its source metadata is inconsistent. Missing values remain null. |
| `tilgjengelighetsvurdering` | `accessibilityStatus` | Mapped to the statuses below. Missing or unknown values become null and display “Ikke registrert”. Unknown codes are logged. |
| `kommentar` | `comments` | Displayed in the detail view. Missing or blank text becomes null and the field is omitted from the view. |
| `last_edited_date` | `sourceModifiedAt` | Epoch milliseconds are converted to an `Instant`. Missing or unusable values become null. Included in the API but not displayed. |

`forvalter` is not imported or displayed. The API includes `source` and the locally generated `id`, but does not expose `sourceId`.

### Accessibility labels

| Source code | Stored status | Norwegian label |
| --- | --- | --- |
| 1 | `ACCESSIBLE` | Tilgjengelig |
| 2 | `DIFFICULT_ACCESS` | Vanskelig tilgjengelig |
| 3 | `NOT_ACCESSIBLE` | Ikke tilgjengelig |
| 4 | `NOT_ASSESSED` | Ikke vurdert |
| Missing or unknown | null | Ikke registrert |

These labels describe the source's accessibility assessment, not whether a toilet is currently open.

### Coordinates

The importer requests `outSR=4326`, which returns WGS84 coordinates. GeoJSON orders them as:

```text
[longitude, latitude]
```

The mapper assigns the first value to longitude and the second to latitude. Leaflet marker positions use latitude followed by longitude, so the frontend supplies them in that order. Both source values must be numeric and within the valid geographical ranges.

## Import flow

```text
ArcGIS client → mapper → import service → transactional writer → PostgreSQL
```

The import service coordinates the flow: it calls the client, passes each returned feature through the mapper, checks the mapped records and then invokes the writer.

1. `ToiletSourceClient` requests the record count, then fetches pages ordered by `objectid`. It requests 50 records per page by default and verifies that the total fetched matches the count.
2. `ToiletSourceMapper` converts source properties into `Toilet` objects. It rejects records without a usable source ID or coordinates and preserves missing optional values as null.
3. `ToiletImportService` collects the valid records, counts rejected records and checks for duplicate source identities. Fetching and mapping finish before database writing starts.
4. `ToiletImportWriter` looks up each source identity, creates new rows and updates changed fields on existing rows in one transaction.
5. PostgreSQL stores the result. A successful import logs counts for created, updated, unchanged and rejected records.

### Stable identity and repeated imports

The local `id` identifies a database row and is used by the application API. The pair `source` and `sourceId` identifies the corresponding source record: `source` is `OSLO_KOMMUNE`, and `sourceId` comes from `globalid`.

A database uniqueness constraint protects this pair. The importer uses it to find existing records instead of matching names or coordinates. Names and coordinates can therefore change without creating a new toilet or changing its local ID.

The import is idempotent: importing unchanged source data again leaves the same rows in place. Updates are detected by comparing the name, coordinates, toilet type, accessibility status, comments and source modification timestamp. The timestamp is one compared field, not the sole test for whether a record has changed.

### Why the writer is a separate Spring bean

The service calls the writer through Spring's transaction support. The writer's `@Transactional` method starts the database transaction around the writes. Keeping this call between separate beans allows Spring to apply that boundary; simply calling another method on the same object would not apply the annotation in the same way.

This also avoids holding a database transaction open while waiting for ArcGIS. Existing rows loaded by the writer are managed by JPA, so changes to their fields are saved through dirty checking. New rows are saved explicitly, and the writer flushes before returning.

### Failure behavior

HTTP or parsing failures, ArcGIS error responses, an unexpected record count, empty pages or an incomplete total stop the import before writing. Duplicate identities among mapped records and a dataset with no valid records also stop it.

Individual records with missing IDs or invalid coordinates are rejected and counted; valid records can still be imported. Missing optional fields do not reject a record. An update can replace a previously populated optional field with null if that is what the source now contains.

Database writes share one transaction. If a database write or commit fails, the import's writes roll back, preserving the data that existed before that transaction. This protection covers the data import; Flyway schema migration runs separately during application startup.

The importer does not delete toilets that are missing from a later source response. Those existing records are retained. There is no scheduled refresh or deletion synchronization.

## Run an explicit import

Start PostgreSQL first. From the repository root:

```powershell
docker compose up -d postgres
docker compose ps
```

From `backend`, in Windows PowerShell:

```powershell
.\mvnw.cmd "-Dspring-boot.run.arguments=--toilapp.import.enabled=true --spring.main.web-application-type=none" spring-boot:run
```

From `backend`, on macOS or Linux:

```bash
sh mvnw -Dspring-boot.run.arguments="--toilapp.import.enabled=true --spring.main.web-application-type=none" spring-boot:run
```

The flags enable one import and disable the web server for that run. Normal server startup keeps `toilapp.import.enabled=false`, so serving API requests does not trigger a source refresh.

For a packaged backend, the equivalent command from `backend` is:

```text
java -jar target/toilapp-0.0.1-SNAPSHOT.jar --toilapp.import.enabled=true --spring.main.web-application-type=none
```

The process uses the configured `DB_URL`, `DB_USERNAME` and `DB_PASSWORD`, with local defaults when these are absent. For Railway, run the import separately with access to the intended PostgreSQL service and its variables. Do not enable import permanently on the API service.

## Inspect the result with PowerShell

With the local API server running, inspect the stored data without starting another import:

```powershell
$toilets = @(Invoke-RestMethod -Uri 'http://localhost:8080/api/toilets')
$toilets.Count
$toilets | Select-Object -First 5 id, name, accessibilityStatus, sourceModifiedAt
$toilets | Where-Object { $null -eq $_.name } | Select-Object id, name
$toilets | Group-Object accessibilityStatus | Select-Object Name, Count
```

To inspect the deployed API instead:

```powershell
$toilets = @(Invoke-RestMethod -Uri 'https://toilapp-backend-production.up.railway.app/api/toilets')
$toilets.Count
$toilets | Select-Object -First 5 id, name, accessibilityStatus, comments
```

To inspect local database identities directly, run from the repository root:

```powershell
docker compose exec -T postgres psql -U toilapp -d toilapp -c "SELECT count(*) FROM toilets;"
docker compose exec -T postgres psql -U toilapp -d toilapp -c "SELECT id, source, source_id, name FROM toilets ORDER BY id LIMIT 5;"
```

The API count reports stored rows. It does not prove that the source has not changed since the last import, especially because records absent from later responses are retained.