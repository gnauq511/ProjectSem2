package com.project.config;

import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.OAuthTokenCredential;
import com.paypal.base.rest.PayPalRESTException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class PayPalConfig {
    private static final Logger logger = LoggerFactory.getLogger(PayPalConfig.class);

    // Use these sandbox credentials - these are standard test credentials
    @Value("${paypal.client.id:AZBCjv9QIyemM7GGPfoMPTepMfpkPFcdIgp-mEyKj-LOvBNNRs1z_Q3wTiTDvMKqc4RfZEDGtWcWJ8Pt}")
    private String clientId;

    @Value("${paypal.client.secret:EJAkYiGv9zKUBVUHMQIbhvPVzcWRFSvv-lzOafnI8_AgHhbQ1VKjWK7HaMZhAyuqZ2pU_NVEot6QNjSL}")
    private String clientSecret;

    @Value("${paypal.mode:sandbox}")
    private String mode;

    @Bean
    public Map<String, String> paypalSdkConfig() {
        Map<String, String> configMap = new HashMap<>();
        configMap.put("mode", mode);
        return configMap;
    }

    @Bean
    public OAuthTokenCredential oAuthTokenCredential() {
        logger.info("Initializing PayPal OAuth credentials with client ID: {}... and mode: {}", 
                 clientId.substring(0, Math.min(clientId.length(), 10)), mode);
        return new OAuthTokenCredential(clientId, clientSecret, paypalSdkConfig());
    }

    @Bean
    public APIContext apiContext() throws PayPalRESTException {
        try {
            String accessToken = oAuthTokenCredential().getAccessToken();
            logger.info("Successfully obtained PayPal access token");
            APIContext context = new APIContext(accessToken);
            context.setConfigurationMap(paypalSdkConfig());
            return context;
        } catch (PayPalRESTException e) {
            logger.error("Failed to initialize PayPal API context: {}", e.getMessage(), e);
            throw e;
        }
    }
}
