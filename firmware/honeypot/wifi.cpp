#include <WiFi.h>
#include "wifi.h"
#include "config.h"
#include "config_portal.h"
#include "logger.h"
#include "storage.h"

static char wifiSsid[64];
static char wifiPass[64];
static unsigned long lastReconnectAttempt = 0;

void wifiInit() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  char backend[128], apiKey[128], deviceId[48];
  storageLoadConfig(wifiSsid, wifiPass, backend, apiKey, deviceId, sizeof(wifiSsid));
}

bool wifiConnect() {
  if (strlen(wifiSsid) == 0) {
    LOGW("WIFI", "No SSID configured — starting config portal");
    configPortalStart();
    return false;
  }

  LOGI("WIFI", "Connecting to %s", wifiSsid);
  WiFi.begin(wifiSsid, wifiPass);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(250);
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    LOGI("WIFI", "Connected — IP: %s RSSI: %d", WiFi.localIP().toString().c_str(), WiFi.RSSI());
    return true;
  }

  LOGW("WIFI", "Connection failed — starting config portal");
  configPortalStart();
  return false;
}

bool wifiIsConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void wifiLoop() {
  if (WiFi.status() == WL_CONNECTED) return;
  if (millis() - lastReconnectAttempt < WIFI_RECONNECT_MS) return;
  lastReconnectAttempt = millis();
  LOGW("WIFI", "Reconnecting...");
  WiFi.disconnect();
  WiFi.begin(wifiSsid, wifiPass);
}

const char* wifiLocalIP() {
  static char ip[16];
  if (WiFi.status() == WL_CONNECTED) {
    strncpy(ip, WiFi.localIP().toString().c_str(), sizeof(ip) - 1);
  } else {
    ip[0] = '\0';
  }
  return ip;
}

int wifiRSSI() {
  return WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : 0;
}
