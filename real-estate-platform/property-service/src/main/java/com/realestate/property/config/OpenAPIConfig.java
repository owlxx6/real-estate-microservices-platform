package com.realestate.property.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {
    
    @Bean
    public OpenAPI propertyServiceAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Property Service API")
                        .description("Microservice for managing real estate properties (sale and rental)")
                        .version("1.0.0"));
    }
}

