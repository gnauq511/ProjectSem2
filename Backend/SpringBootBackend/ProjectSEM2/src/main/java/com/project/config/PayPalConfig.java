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

    // Default mode if environment variable is not set
    private static final String DEFAULT_MODE = "sandbox";
    
    // Properties from application.properties with fallback values
    @Value("${paypal.client.id:}")
    private String clientIdFromProps;
    
    @Value("${paypal.client.secret:}")
    private String clientSecretFromProps;
    
    @Value("${paypal.mode:sandbox}")
    private String modeFromProps;

    // Get client ID from environment variable or application.properties
    private String getClientId() {
        // Try environment variable first
        String envClientId = System.getenv("PAYPAL_CLIENT_ID");
        if (envClientId != null && !envClientId.isEmpty()) {
            logger.info("Using PayPal Client ID from environment variable");
            return envClientId;
        }
        
        // Then try application.properties
        if (clientIdFromProps != null && !clientIdFromProps.isEmpty()) {
            logger.info("Using PayPal Client ID from application.properties");
            return clientIdFromProps;
        }
        
        // Use default sandbox credentials for development
        logger.warn("No PayPal Client ID found in environment or properties, using sandbox default");
        return "AZBCjv9QIyemM7GGPfoMPTepMfpkPFcdIgp-mEyKj-LOvBNNRs1z_Q3wTiTDvMKqc4RfZEDGtWcWJ8Pt";
    }
    
    // Get client secret from environment variable or application.properties
    private String getClientSecret() {
        // Try environment variable first
        String envClientSecret = System.getenv("PAYPAL_CLIENT_SECRET");
        if (envClientSecret != null && !envClientSecret.isEmpty()) {
            logger.info("Using PayPal Client Secret from environment variable");
            return envClientSecret;
        }
        
        // Then try application.properties
        if (clientSecretFromProps != null && !clientSecretFromProps.isEmpty()) {
            logger.info("Using PayPal Client Secret from application.properties");
            return clientSecretFromProps;
        }
        
        // Use default sandbox credentials for development
        logger.warn("No PayPal Client Secret found in environment or properties, using sandbox default");
        return "EJAkYiGv9zKUBVUHMQIbhvPVzcWRFSvv-lzOafnI8_AgHhbQ1VKjWK7HaMZhAyuqZ2pU_NVEot6QNjSL";
    }
    
    // Get mode from environment variable, application.properties, or fallback to default
    private String getMode() {
        // Try environment variable first
        String envMode = System.getenv("PAYPAL_MODE");
        if (envMode != null && !envMode.isEmpty()) {
            logger.info("Using PayPal mode from environment variable: {}", envMode);
            return envMode;
        }
        
        // Then try application.properties
        if (modeFromProps != null && !modeFromProps.isEmpty()) {
            logger.info("Using PayPal mode from application.properties: {}", modeFromProps);
            return modeFromProps;
        }
        
        // Use default mode
        logger.info("No PayPal mode found in environment or properties, using default: {}", DEFAULT_MODE);
        return DEFAULT_MODE;
    }

    @Bean
    public Map<String, String> paypalSdkConfig() {
        Map<String, String> configMap = new HashMap<>();
        configMap.put("mode", getMode());
        return configMap;
    }

    @Bean
    public OAuthTokenCredential oAuthTokenCredential() {
        String clientId = getClientId();
        String clientSecret = getClientSecret();
        
        logger.info("Initializing PayPal OAuth credentials with client ID: {}... and mode: {}", 
                 clientId.substring(0, Math.min(clientId.length(), 10)), getMode());
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
