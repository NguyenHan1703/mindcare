package com.mindcare.mindcare_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class MindcareBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(MindcareBackendApplication.class, args);
		System.out.println("MindCare Backend Application has started successfully! 🚀");
	}
}
