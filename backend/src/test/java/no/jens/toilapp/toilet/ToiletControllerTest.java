package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ToiletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getToiletsReturnsHttpOk() throws Exception {
        mockMvc.perform(get("/api/toilets"))
                .andExpect(status().isOk());
    }

    @Test
    void getToiletsReturnsFiveToilets() throws Exception {
        mockMvc.perform(get("/api/toilets"))
                .andExpect(jsonPath("$.length()").value(5));
    }

    @Test
    void getToiletsReturnsExpectedFields() throws Exception {
        mockMvc.perform(get("/api/toilets"))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Youngstorget public toilet"))
                .andExpect(jsonPath("$[0].address").value("Youngstorget, Oslo"))
                .andExpect(jsonPath("$[0].latitude").value(59.9140))
                .andExpect(jsonPath("$[0].longitude").value(10.7522))
                .andExpect(jsonPath("$[0].free").value(true))
                .andExpect(jsonPath("$[0].publicToilet").value(true))
                .andExpect(jsonPath("$[0].requiresEntry").value(false))
                .andExpect(jsonPath("$[0].cleanlinessRating").value(4.1));
    }

    @Test
    void getToiletByIdReturnsExpectedToilet() throws Exception {
        mockMvc.perform(get("/api/toilets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Youngstorget public toilet"))
                .andExpect(jsonPath("$.address").value("Youngstorget, Oslo"));
    }

    @Test
    void getToiletByIdReturnsNotFoundForUnknownId() throws Exception {
        mockMvc.perform(get("/api/toilets/999"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(""));
    }
}
