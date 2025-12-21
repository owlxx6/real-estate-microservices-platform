package com.realestate.client.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI clientServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Client Service API")
                        .description("Client, Agent, and Visit Management Microservice")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Real Estate Platform")
                                .email("contact@realestate.com")));
    }
}

