package no.jens.toilapp.importer;

public record ToiletImportResult(
        int created,
        int updated,
        int unchanged,
        int rejected
) {
}
