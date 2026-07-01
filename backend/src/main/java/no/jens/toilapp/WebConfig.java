package no.jens.toilapp;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Contains small web settings that apply to the whole backend.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Allows the local Vite frontend ports used while developing Toilapp.
     *
     * @param registry Spring's CORS registry for MVC endpoints
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:5174")
                .allowedMethods("GET");
    }
}
