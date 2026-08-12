#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "api.h"
#include "config.h"
#include "logger.h"
#include "storage.h"
#include "wifi.h"

static char backendUrl[128];
static char apiKey[128];
static char deviceId[48];
static unsigned long lastHeartbeat = 0;
static bool registered = false;

static bool postJson(const char* path, const char* json, int* httpCodeOut) {
  if (!wifiIsConnected()) return false;

  char url[192];
  snprintf(url, sizeof(url), "%s%s", backendUrl, path);

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  char authHeader[160];
  snprintf(authHeader, sizeof(authHeader), "Bearer %s", apiKey);
  http.addHeader("Authorization", authHeader);
  http.setTimeout(5000);

  int code = http.POST((uint8_t*)json, strlen(json));
  if (httpCodeOut) *httpCodeOut = code;
  http.end();
  return code >= 200 && code < 300;
}

static void registerDevice() {
  StaticJsonDocument<384> doc;
  doc["device_id"] = deviceId;
  doc["hostname"] = "cyber-eye-honeypot";
  doc["firmware_version"] = FIRMWARE_VERSION;
  doc["ip"] = wifiLocalIP();
  doc["mac"] = WiFi.macAddress();
  doc["chip_type"] = ESP.getChipModel();

  char json[384];
  serializeJson(doc, json, sizeof(json));
  if (postJson(PATH_REGISTER, json, nullptr)) {
    registered = true;
    LOGI("API", "Device registered: %s", deviceId);
  } else {
    LOGW("API", "Registration failed");
  }
}

static void sendHeartbeat() {
  StaticJsonDocument<256> doc;
  doc["device_id"] = deviceId;
  doc["free_heap"] = ESP.getFreeHeap();
  doc["wifi_rssi"] = wifiRSSI();
  doc["uptime_sec"] = millis() / 1000;
  doc["ip"] = wifiLocalIP();

  char json[256];
  serializeJson(doc, json, sizeof(json));
  postJson(PATH_HEARTBEAT, json, nullptr);
}

static bool flushOneEvent() {
  QueuedEvent ev;
  if (!storageDequeueEvent(ev)) return false;

  StaticJsonDocument<3072> doc;
  doc["device"] = ev.device;
  doc["service"] = ev.service;
  doc["ip"] = ev.ip;
  doc["port"] = ev.port;
  doc["protocol"] = ev.protocol;
  doc["payload"] = ev.payload;
  doc["bytes_in"] = ev.bytesIn;
  doc["bytes_out"] = ev.bytesOut;

  char json[3072];
  serializeJson(doc, json, sizeof(json));
  int code = 0;
  if (postJson(PATH_EVENT, json, &code)) {
    LOGI("API", "Flushed queued event: %s from %s", ev.service, ev.ip);
    return true;
  }
  storageEnqueueEvent(ev);
  return false;
}

void apiInit() {
  char ssid[64], pass[64];
  storageLoadConfig(ssid, pass, backendUrl, apiKey, deviceId, sizeof(ssid));
  storageEnsureDeviceId(deviceId, sizeof(deviceId));
  LOGI("API", "Backend: %s Device: %s", backendUrl, deviceId);
}

void apiLoop() {
  if (!wifiIsConnected()) return;

  if (!registered) registerDevice();

  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeat = millis();
    sendHeartbeat();
  }

  while (storageQueueCount() > 0) {
    if (!flushOneEvent()) break;
  }
}

void apiSendEvent(const char* service, const char* ip, int port, const char* protocol,
                  const char* payload, int bytesIn, int bytesOut) {
  QueuedEvent ev;
  memset(&ev, 0, sizeof(ev));
  strncpy(ev.device, deviceId, sizeof(ev.device) - 1);
  strncpy(ev.service, service, sizeof(ev.service) - 1);
  strncpy(ev.ip, ip, sizeof(ev.ip) - 1);
  ev.port = port;
  strncpy(ev.protocol, protocol, sizeof(ev.protocol) - 1);
  if (payload) {
    strncpy(ev.payload, payload, sizeof(ev.payload) - 1);
  }
  ev.bytesIn = bytesIn;
  ev.bytesOut = bytesOut;
  ev.timestamp = millis();
  ev.valid = true;

  StaticJsonDocument<3072> doc;
  doc["device"] = ev.device;
  doc["service"] = ev.service;
  doc["ip"] = ev.ip;
  doc["port"] = ev.port;
  doc["protocol"] = ev.protocol;
  doc["payload"] = ev.payload;
  doc["bytes_in"] = ev.bytesIn;
  doc["bytes_out"] = ev.bytesOut;

  char json[3072];
  serializeJson(doc, json, sizeof(json));

  int code = 0;
  if (wifiIsConnected() && postJson(PATH_EVENT, json, &code)) {
    LOGI("API", "Event sent: %s from %s", service, ip);
  } else {
    storageEnqueueEvent(ev);
    LOGW("API", "Event queued (backend unreachable): %s", service);
  }
}
