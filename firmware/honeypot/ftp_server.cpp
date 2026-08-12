#include <WiFi.h>
#include "ftp_server.h"
#include "api.h"
#include "config.h"
#include "logger.h"

static WiFiServer server(21);

void ftpServerInit() {
  server.begin();
  LOGI("FTP", "Fake FTP banner listening on port 21");
}

void ftpServerLoop() {
  WiFiClient client = server.available();
  if (!client) return;

  String ipStr = client.remoteIP().toString();
  LOGI("FTP", "Connection from %s", ipStr.c_str());

  client.println("220 ProFTPD 1.3.6 Server (Enterprise NAS)");

  char payload[MAX_PAYLOAD_SIZE];
  size_t len = 0;
  unsigned long start = millis();

  while (client.connected() && (millis() - start < CLIENT_TIMEOUT_MS)) {
    while (client.available() && len < sizeof(payload) - 1) {
      char c = client.read();
      payload[len++] = c;
      if (c == '\n') {
        char line[128];
        size_t lineStart = len;
        for (int i = (int)len - 2; i >= 0; i--) {
          if (payload[i] == '\n') { lineStart = i + 1; break; }
        }
        size_t lineLen = len - lineStart;
        if (lineLen > 127) lineLen = 127;
        memcpy(line, payload + lineStart, lineLen);
        line[lineLen] = '\0';

        if (strncasecmp(line, "USER", 4) == 0) {
          client.println("331 Password required for user.");
        } else if (strncasecmp(line, "PASS", 4) == 0) {
          client.println("530 Login incorrect.");
          break;
        } else if (strncasecmp(line, "QUIT", 4) == 0) {
          client.println("221 Goodbye.");
          break;
        } else {
          client.println("500 Unknown command.");
        }
      }
    }
  }
  payload[len] = '\0';
  client.stop();

  apiSendEvent("ftp", ipStr.c_str(), 21, "tcp", payload, (int)len, 120);
}
