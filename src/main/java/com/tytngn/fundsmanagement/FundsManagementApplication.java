package com.tytngn.fundsmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class FundsManagementApplication {

    public static void main(String[] args) {

        SpringApplication.run(FundsManagementApplication.class, args);
    }

}
