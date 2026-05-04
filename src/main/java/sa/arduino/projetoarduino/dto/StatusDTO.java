package sa.arduino.projetoarduino.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatusDTO {
    private int total;
    private int limite;
    private boolean lotado;
    private boolean permitido;
}