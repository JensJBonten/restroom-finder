package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ToiletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsAllToilets() throws Exception {
        mockMvc.perform(get("/api/toilets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));
    }

    @Test
    void returnsToiletById() throws Exception {
        mockMvc.perform(get("/api/toilets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Youngstorget public toilet"));
    }

    @Test
    void returnsNotFoundForUnknownId() throws Exception {
        mockMvc.perform(get("/api/toilets/999"))
                .andExpect(status().isNotFound());
    }
}