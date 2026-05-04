package sa.arduino.projetoarduino.exception;

public class CapacidadeMaximaException extends RuntimeException {
    public CapacidadeMaximaException() {
        super("Capacidade máxima atingida.");
    }
}