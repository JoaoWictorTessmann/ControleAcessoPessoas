package sa.arduino.projetoarduino.controller;

import sa.arduino.projetoarduino.dto.StatusDTO;
import sa.arduino.projetoarduino.service.PresencaService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class PresencaController {

    private final PresencaService service;

    public PresencaController(PresencaService service) {
        this.service = service;
    }

    @PostMapping("/entrada")
    public StatusDTO entrada() {
        return service.entrada();
    }

    @PostMapping("/saida")
    public StatusDTO saida() {
        return service.saida();
    }

    @GetMapping("/status")
    public StatusDTO status() {
        return service.status();
    }

    @PostMapping("/config/limite")
    public StatusDTO setLimite(@RequestParam int valor) {
        return service.setLimite(valor);
    }

    @PostMapping("/reset")
    public StatusDTO reset() {
        return service.reset();
    }
}