package sa.arduino.projetoarduino.model;

import lombok.Data;

@Data
public class SistemaEstado {
    private int pessoasPresentes = 0;
    private int limiteMaximo = 10;
}