package com.tytngn.fundsmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FundsManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(FundsManagementApplication.class, args);
    }

}
