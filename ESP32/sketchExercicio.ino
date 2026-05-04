#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* SSID        = "Wokwi-GUEST";
const char* PASSWORD    = "";
const char* URL_ENTRADA = "SUA_URL_AQUI/entrada"; //URL é alterada conforme cloudFlare é iniciado
const char* URL_SAIDA   = "SUA_URL_AQUI/saida"; //URL é alterada conforme cloudFlare é iniciado

const int LED_RED      = 12;
const int LED_GREEN    = 14;
const int BUTTON_RED   = 26;
const int BUTTON_GREEN = 27;

const unsigned long DEBOUNCE_DELAY = 50;
const unsigned long LED_DURATION   = 2000;

unsigned long lastDebounceRed   = 0;
unsigned long lastDebounceGreen = 0;
unsigned long ledRedTimer       = 0;
unsigned long ledGreenTimer     = 0;

bool ledRedActive    = false;
bool ledGreenActive  = false;
bool lastStableRed   = HIGH;
bool lastStableGreen = HIGH;
int  lastRawRed      = HIGH;
int  lastRawGreen    = HIGH;

void setup() {
  pinMode(LED_RED,      OUTPUT);
  pinMode(LED_GREEN,    OUTPUT);
  pinMode(BUTTON_RED,   INPUT_PULLUP);
  pinMode(BUTTON_GREEN, INPUT_PULLUP);
  Serial.begin(9600);
  conectarWifi();
}

void conectarWifi() {
  WiFi.begin(SSID, PASSWORD);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado! IP: " + WiFi.localIP().toString());
}

bool enviarEvento(const char* url) {
  if (WiFi.status() != WL_CONNECTED) {
    conectarWifi();
    return false;
  }

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(3000);

  int httpCode = http.POST("{}");

  if (httpCode != 200) {
    Serial.print("Erro HTTP: ");
    Serial.println(httpCode);
    http.end();
    return false;
  }

  String resposta = http.getString();
  http.end();

  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, resposta)) return false;

  bool permitido = doc["permitido"];
  Serial.println(permitido ? "Permitido: SIM" : "Permitido: NAO");
  Serial.print("Total: ");
  Serial.println((int)doc["total"]);

  return permitido;
}

void loop() {
  unsigned long now = millis();
  int rawRed   = digitalRead(BUTTON_RED);
  int rawGreen = digitalRead(BUTTON_GREEN);

  // Botão ENTRADA
  if (rawGreen != lastRawGreen) lastDebounceGreen = now;
  if ((now - lastDebounceGreen) > DEBOUNCE_DELAY) {
    if (rawGreen != lastStableGreen) {
      lastStableGreen = rawGreen;
      if (lastStableGreen == LOW) {
        bool permitido = enviarEvento(URL_ENTRADA);
        if (permitido) {
          digitalWrite(LED_RED, LOW);
          ledRedActive = false;
          digitalWrite(LED_GREEN, HIGH);
          ledGreenTimer  = now;
          ledGreenActive = true;
        } else {
          for (int i = 0; i < 3; i++) {
            digitalWrite(LED_RED, HIGH); delay(200);
            digitalWrite(LED_RED, LOW);  delay(200);
          }
        }
      }
    }
  }
  lastRawGreen = rawGreen;

  // Botão SAÍDA
  if (rawRed != lastRawRed) lastDebounceRed = now;
  if ((now - lastDebounceRed) > DEBOUNCE_DELAY) {
    if (rawRed != lastStableRed) {
      lastStableRed = rawRed;
      if (lastStableRed == LOW) {
        bool permitido = enviarEvento(URL_SAIDA);
        if (permitido) {
          digitalWrite(LED_GREEN, LOW);
          ledGreenActive = false;
          digitalWrite(LED_RED, HIGH);
          ledRedTimer  = now;
          ledRedActive = true;
        } else {
          for (int i = 0; i < 3; i++) {
            digitalWrite(LED_RED, HIGH); delay(200);
            digitalWrite(LED_RED, LOW);  delay(200);
          }
        }
      }
    }
  }
  lastRawRed = rawRed;

  // Desliga LEDs após 2s
  if (ledGreenActive && (now - ledGreenTimer) >= LED_DURATION) {
    digitalWrite(LED_GREEN, LOW);
    ledGreenActive = false;
  }
  if (ledRedActive && (now - ledRedTimer) >= LED_DURATION) {
    digitalWrite(LED_RED, LOW);
    ledRedActive = false;
  }
}