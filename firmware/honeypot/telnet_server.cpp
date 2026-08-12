#include <WiFi.h>
#include "telnet_server.h"
#include "api.h"
#include "config.h"
#include "logger.h"

static WiFiServer server(23);

static void readPayload(WiFiClient& client, char* buf, size_t maxLen, size_t* outLen) {
  *outLen = 0;
  unsigned long start = millis();
  while (client.connected() && (millis() - start < CLIENT_TIMEOUT_MS)) {
    while (client.available() && *outLen < maxLen - 1) {
      buf[(*outLen)++] = client.read();
    }
  }
  buf[*outLen] = '\0';
}

void telnetServerInit() {
  server.begin();
  LOGI("TELNET", "Fake router CLI listening on port 23");
}

void telnetServerLoop() {
  WiFiClient client = server.available();
  if (!client) return;

  String ipStr = client.remoteIP().toString();
  LOGI("TELNET", "Connection from %s", ipStr.c_str());

  client.print("\r\n\r\nRouter OS v3.1 Enterprise\r\nlogin: ");
  delay(100);

  char payload[MAX_PAYLOAD_SIZE];
  size_t len = 0;
  readPayload(client, payload, sizeof(payload), &len);

  client.print("\r\nPassword: ");
  delay(200);
  size_t extra = len;
  readPayload(client, payload + len, sizeof(payload) - len, &extra);
  len += extra;

  client.println("\r\nLogin incorrect.");
  client.stop();

  apiSendEvent("telnet", ipStr.c_str(), 23, "tcp", payload, (int)len, 80);
}
