#include <WiFi.h>
#include "ssh_server.h"
#include "api.h"
#include "config.h"
#include "logger.h"

static WiFiServer server(22);

void sshServerInit() {
  server.begin();
  LOGI("SSH", "Fake OpenSSH banner listening on port 22");
}

void sshServerLoop() {
  WiFiClient client = server.available();
  if (!client) return;

  String ipStr = client.remoteIP().toString();
  LOGI("SSH", "Connection from %s", ipStr.c_str());

  client.println("SSH-2.0-OpenSSH_8.4");
  client.print("login as: ");

  char payload[MAX_PAYLOAD_SIZE];
  size_t len = 0;
  unsigned long start = millis();
  while (client.connected() && (millis() - start < CLIENT_TIMEOUT_MS)) {
    while (client.available() && len < sizeof(payload) - 1) {
      payload[len++] = client.read();
    }
  }
  payload[len] = '\0';

  client.println("\r\nPermission denied (publickey,password).");
  client.stop();

  apiSendEvent("ssh", ipStr.c_str(), 22, "tcp", payload, (int)len, 60);
}
