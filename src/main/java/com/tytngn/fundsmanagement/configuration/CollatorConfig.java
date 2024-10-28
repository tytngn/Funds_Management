package com.tytngn.fundsmanagement.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.text.Collator;
import java.util.Locale;

@Configuration
public class CollatorConfig {
    @Bean
    public Collator vietnameseCollator() {
        return Collator.getInstance(new Locale("vi", "VN"));
    }
}
