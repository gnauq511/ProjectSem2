package com.project.config;

import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.OAuthTokenCredential;
import com.paypal.base.rest.PayPalRESTException;
import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class PayPalConfig {
    private static final Logger logger = LoggerFactory.getLogger(PayPalConfig.class);
    
    @Autowired
    private Dotenv dotenv;

    // Use environment variables or fallback to properties
    @Value("${paypal.client.id:}")
    private String clientIdFromProps;

    @Value("${paypal.client.secret:}")
    private String clientSecretFromProps;

    @Value("${paypal.mode:sandbox}")
    private String modeFromProps;

    // Get client ID from environment variable or fallback to properties
    private String getClientId() {
        String envClientId = dotenv.get("PAYPAL_CLIENT_ID");
        if (envClientId != null && !envClientId.isEmpty()) {
            return envClientId;
        }
        return clientIdFromProps;
    }
    
    // Get client secret from environment variable or fallback to properties
    private String getClientSecret() {
        String envClientSecret = dotenv.get("PAYPAL_CLIENT_SECRET");
        if (envClientSecret != null && !envClientSecret.isEmpty()) {
            return envClientSecret;
        }
        return clientSecretFromProps;
    }
    
    // Get mode from environment variable or fallback to properties
    private String getMode() {
        String envMode = dotenv.get("PAYPAL_MODE");
        if (envMode != null && !envMode.isEmpty()) {
            return envMode;
        }
        return modeFromProps;
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
