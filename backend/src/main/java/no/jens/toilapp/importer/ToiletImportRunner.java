package no.jens.toilapp.importer;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Runs one import when the application is explicitly started in import mode.
 */
@Component
@ConditionalOnProperty(name = "toilapp.import.enabled", havingValue = "true")
public class ToiletImportRunner implements ApplicationRunner {

    private final ToiletImportService importService;

    public ToiletImportRunner(ToiletImportService importService) {
        this.importService = importService;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        importService.importToilets();
    }
}