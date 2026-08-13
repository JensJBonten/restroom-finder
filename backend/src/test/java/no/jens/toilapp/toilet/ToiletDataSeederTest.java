package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class ToiletDataSeederTest {

    @Autowired
    private ToiletRepository toiletRepository;

    @Autowired
    private ToiletDataSeeder toiletDataSeeder;

    @Test
    void doesNotDuplicateExistingSeedData() {
        assertEquals(5, toiletRepository.count());

        toiletDataSeeder.run(new DefaultApplicationArguments());

        assertEquals(5, toiletRepository.count());
    }
}