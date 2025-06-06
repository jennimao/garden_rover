#include <WiFiS3.h>

// WiFi info
char ssid[] = "icecreamfarm";
char pass[] = "pumpkinicedtea";

IPAddress local_IP(10, 0, 0, 200);
IPAddress gateway(10, 0, 0, 1);
IPAddress subnet(255, 255, 255, 0);

WiFiServer server(80);

// Motor A
const int enA = 9;
const int in1 = 8;
const int in2 = 7;

// Motor B
const int enB = 3;
const int in3 = 5;
const int in4 = 4;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Motor pins
  pinMode(enA, OUTPUT);
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);

  pinMode(enB, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);

  stopMotors();  // Initial state

  // WiFi setup
  WiFi.config(local_IP, gateway, subnet);
  WiFi.begin(ssid, pass);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  server.begin();
  Serial.println("Server started");
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    String request = "";
    bool currentLineIsBlank = true;

    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        request += c;

        if (c == '\n' && currentLineIsBlank) {
          int methodEnd = request.indexOf(' ');
          int pathStart = methodEnd + 1;
          int pathEnd = request.indexOf(' ', pathStart);
          String path = request.substring(pathStart, pathEnd);

          Serial.print("Request path: ");
          Serial.println(path);

          if (path.startsWith("/move?direction=")) {
            String direction = path.substring(String("/move?direction=").length());

            Serial.print("Direction command received: ");
            Serial.println(direction);

            handleDirection(direction);  // 🚀 Call motor function

            // Send HTTP response
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: text/plain");
            client.println("Access-Control-Allow-Origin: *");
            client.println();
            client.print("ACK: received direction ");
            client.println(direction);
          } else {
            client.println("HTTP/1.1 404 Not Found");
            client.println("Access-Control-Allow-Origin: *");
            client.println();
            client.println("Not Found");
          }
          break;
        }

        if (c == '\n') {
          currentLineIsBlank = true;
        } else if (c != '\r') {
          currentLineIsBlank = false;
        }
      }
    }

    delay(1);
    client.stop();
  }
}

void handleDirection(String dir) {
  if (dir == "up") {
    moveForward();
  } else if (dir == "down") {
    moveBackward();
  } else if (dir == "left") {
    turnLeft();
  } else if (dir == "right") {
    turnRight();
  } else if (dir == "stop") {
    stopMotors();
  }
}

void moveForward() {
  analogWrite(enA, 80);  // was 200
  analogWrite(enB, 80);  // was 200
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  digitalWrite(in3, HIGH);
  digitalWrite(in4, LOW);
}

void moveBackward() {
  analogWrite(enA, 80);  // was 200
  analogWrite(enB, 80);  // was 200
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  digitalWrite(in3, LOW);
  digitalWrite(in4, HIGH);
}

void turnLeft() {
  analogWrite(enA, 80);  // was 150
  analogWrite(enB, 80);  // was 150
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  digitalWrite(in3, HIGH);
  digitalWrite(in4, LOW);
}

void turnRight() {
  analogWrite(enA, 80);  // was 150
  analogWrite(enB, 80);  // was 150
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);
  digitalWrite(in4, HIGH);
}

void stopMotors() {
  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  analogWrite(enA, 0);
  analogWrite(enB, 0);
}