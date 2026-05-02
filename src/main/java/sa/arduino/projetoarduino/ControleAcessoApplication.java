package sa.arduino.projetoarduino;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProjetoarduinoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjetoarduinoApplication.class, args);
		System.out.println("Arduino Application started successfully.");
		System.out.println("Access aplication at: http://localhost:8080/");
	}

}
