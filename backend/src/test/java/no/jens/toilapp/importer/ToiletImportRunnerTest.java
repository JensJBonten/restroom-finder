package no.jens.toilapp.importer;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class ToiletImportRunnerTest {

    @Test
    void runsOneImport() {
        ToiletImportService importService = mock(ToiletImportService.class);
        ToiletImportRunner importRunner = new ToiletImportRunner(importService);

        importRunner.run(new DefaultApplicationArguments());

        verify(importService).importToilets();
    }
}