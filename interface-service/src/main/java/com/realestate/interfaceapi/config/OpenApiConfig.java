package com.realestate.interfaceapi.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI interfaceServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Interface Service API")
                        .description("Data Aggregation and Orchestration Microservice")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Real Estate Platform")
                                .email("contact@realestate.com")));
    }
}

