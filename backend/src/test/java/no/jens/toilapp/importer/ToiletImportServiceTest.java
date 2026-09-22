package no.jens.toilapp.importer;

import com.fasterxml.jackson.databind.JsonNode;
import no.jens.toilapp.toilet.Toilet;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ToiletImportServiceTest {

    @Mock
    private ToiletSourceClient sourceClient;

    @Mock
    private ToiletSourceMapper sourceMapper;

    @Mock
    private ToiletImportWriter importWriter;

    @InjectMocks
    private ToiletImportService importService;

    @Test
    void writesMappedToiletsAndCountsRejectedFeatures() {
        JsonNode validFeature = mock(JsonNode.class);
        JsonNode rejectedFeature = mock(JsonNode.class);
        Toilet mappedToilet = createToilet();

        when(sourceClient.fetchAllToiletFeatures())
                .thenReturn(List.of(validFeature, rejectedFeature));
        when(sourceMapper.mapToiletFeature(validFeature))
                .thenReturn(Optional.of(mappedToilet));
        when(sourceMapper.mapToiletFeature(rejectedFeature))
                .thenReturn(Optional.empty());
        when(importWriter.writeToilets(anyList(), eq(1)))
                .thenReturn(new ToiletImportResult(1, 0, 0, 1));

        ToiletImportResult result = importService.importToilets();

        assertThat(result.created()).isEqualTo(1);
        assertThat(result.rejected()).isEqualTo(1);
        verify(importWriter).writeToilets(List.of(mappedToilet), 1);
    }

    @Test
    void doesNotWriteWhenSourceFetchFails() {
        when(sourceClient.fetchAllToiletFeatures())
                .thenThrow(new ToiletSourceException("Source unavailable"));

        assertThatThrownBy(importService::importToilets)
                .isInstanceOf(ToiletSourceException.class)
                .hasMessage("Source unavailable");

        verifyNoInteractions(sourceMapper, importWriter);
    }

    @Test
    void rejectsDuplicateSourceIdentifiersBeforeWriting() {
        JsonNode firstFeature = mock(JsonNode.class);
        JsonNode duplicateFeature = mock(JsonNode.class);
        Toilet firstToilet = createToilet();
        Toilet duplicateToilet = createToilet();

        when(sourceClient.fetchAllToiletFeatures())
                .thenReturn(List.of(firstFeature, duplicateFeature));
        when(sourceMapper.mapToiletFeature(firstFeature))
                .thenReturn(Optional.of(firstToilet));
        when(sourceMapper.mapToiletFeature(duplicateFeature))
                .thenReturn(Optional.of(duplicateToilet));

        assertThatThrownBy(importService::importToilets)
                .isInstanceOf(ToiletSourceException.class)
                .hasMessageContaining("duplicate identifier");

        verifyNoInteractions(importWriter);
    }

    private Toilet createToilet() {
        return new Toilet(
                "OSLO_KOMMUNE",
                "{C028B6E2-FC18-4206-9DEB-63BCA9B79CEA}",
                "Steinbruvann sør",
                59.972802841816673,
                10.882284318939066,
                "0",
                "NOT_ASSESSED",
                null,
                Instant.parse("2025-12-22T09:43:50Z")
        );
    }
}