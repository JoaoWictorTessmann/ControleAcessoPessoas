package sa.arduino.projetoarduino;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ControleAcessoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ControleAcessoApplication.class, args);
		System.out.println("Arduino Application started successfully.");
		System.out.println("Access aplication at: http://localhost:8080/");
	}

}
