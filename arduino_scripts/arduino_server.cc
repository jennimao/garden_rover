#include <WiFiS3.h>

char ssid[] = "icecreamfarm";
char pass[] = "pumpkinicedtea";

IPAddress local_IP(10, 0, 0, 200);      // Your new static IP
IPAddress gateway(10, 0, 0, 1);         // Router IP
IPAddress subnet(255, 255, 255, 0);     // Subnet mask

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  delay(1000);

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

        // End of HTTP request header is a blank line
        if (c == '\n' && currentLineIsBlank) {
          // Parse the request line (first line)
          // Example: GET /move?direction=up HTTP/1.1
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
          break; // Exit the reading loop
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
