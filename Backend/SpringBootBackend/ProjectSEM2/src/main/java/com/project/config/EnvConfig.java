package com.project.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class EnvConfig {
    private static final Logger logger = LoggerFactory.getLogger(EnvConfig.class);
    
    @Bean
    public Dotenv dotenv() {
        logger.info("Loading environment variables from .env file");
        return Dotenv.configure()
                .directory(".") // Look for .env in the project root directory
                .ignoreIfMissing() // Don't throw an exception if .env is missing
                .load();
    }
}
