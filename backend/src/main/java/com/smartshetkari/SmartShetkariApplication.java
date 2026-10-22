package com.smartshetkari;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SmartShetkariApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartShetkariApplication.class, args);
    }
}
