package sa.arduino.projetoarduino.service;

import sa.arduino.projetoarduino.dto.StatusDTO;
import sa.arduino.projetoarduino.model.SistemaEstado;
import org.springframework.stereotype.Service;

@Service
public class PresencaService {

    private final SistemaEstado estado = new SistemaEstado();

    public StatusDTO entrada() {
        boolean permitido = estado.getPessoasPresentes() < estado.getLimiteMaximo();
        if (permitido) {
            estado.setPessoasPresentes(estado.getPessoasPresentes() + 1);
        }
        return buildStatus(permitido);
    }

    public StatusDTO saida() {
        boolean permitido = estado.getPessoasPresentes() > 0;
        if (permitido) {
            estado.setPessoasPresentes(estado.getPessoasPresentes() - 1);
        }
        return buildStatus(permitido);
    }

    public StatusDTO status() {
        return buildStatus(estado.getPessoasPresentes() < estado.getLimiteMaximo());
    }

    public StatusDTO setLimite(int novoLimite) {
        estado.setLimiteMaximo(novoLimite);
        return buildStatus(estado.getPessoasPresentes() < estado.getLimiteMaximo());
    }

    public StatusDTO reset() {
        estado.setPessoasPresentes(0);
        return buildStatus(true);
    }

    private StatusDTO buildStatus(boolean permitido) {
        return new StatusDTO(
            estado.getPessoasPresentes(),
            estado.getLimiteMaximo(),
            estado.getPessoasPresentes() >= estado.getLimiteMaximo(),
            permitido
        );
    }
}