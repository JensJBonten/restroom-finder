package no.jens.toilapp.toilet;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ToiletController.class)
class ToiletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ToiletService toiletService;

    private final Toilet youngstorgetToilet = new Toilet(
            "OSLO_KOMMUNE",
            "test-global-id",
            "Youngstorget",
            59.9140,
            10.7522,
            "PUBLIC_TOILET",
            null,
            "Test record",
            Instant.parse("2026-09-12T06:00:00Z")
    );

    @Test
    void getToiletsReturnsExpectedFields() throws Exception {
        when(toiletService.getAllToilets())
                .thenReturn(List.of(youngstorgetToilet));

        mockMvc.perform(get("/api/toilets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].source").value("OSLO_KOMMUNE"))
                .andExpect(jsonPath("$[0].name").value("Youngstorget"))
                .andExpect(jsonPath("$[0].latitude").value(59.9140))
                .andExpect(jsonPath("$[0].longitude").value(10.7522))
                .andExpect(jsonPath("$[0].toiletType").value("PUBLIC_TOILET"))
                .andExpect(jsonPath("$[0].comments").value("Test record"))
                .andExpect(jsonPath("$[0].address").doesNotExist())
                .andExpect(jsonPath("$[0].cleanlinessRating").doesNotExist());
    }

    @Test
    void getToiletByIdReturnsExpectedToilet() throws Exception {
        when(toiletService.getToiletById(1L))
                .thenReturn(Optional.of(youngstorgetToilet));

        mockMvc.perform(get("/api/toilets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("OSLO_KOMMUNE"))
                .andExpect(jsonPath("$.name").value("Youngstorget"));
    }

    @Test
    void getToiletByIdReturnsNotFoundForUnknownId() throws Exception {
        when(toiletService.getToiletById(999L))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/toilets/999"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(""));
    }
}