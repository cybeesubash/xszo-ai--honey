#include "storage.h"
#include "logger.h"
#include <Preferences.h>
#include <WiFi.h>

static Preferences prefs;
static QueuedEvent eventQueue[EVENT_QUEUE_SIZE];
static int queueHead = 0;
static int queueTail = 0;
static int queueCount = 0;

void storageInit() {
  prefs.begin(PREF_NAMESPACE, false);
  memset(eventQueue, 0, sizeof(eventQueue));
}

bool storageLoadConfig(char* ssid, char* pass, char* backend, char* apiKey, char* deviceId, size_t bufLen) {
  String s = prefs.getString(KEY_WIFI_SSID, "");
  String p = prefs.getString(KEY_WIFI_PASS, "");
  String b = prefs.getString(KEY_BACKEND, "http://192.168.1.100:8000");
  String k = prefs.getString(KEY_API_KEY, "");
  String d = prefs.getString(KEY_DEVICE_ID, "");

  strncpy(ssid, s.c_str(), bufLen - 1);
  strncpy(pass, p.c_str(), bufLen - 1);
  strncpy(backend, b.c_str(), bufLen - 1);
  strncpy(apiKey, k.c_str(), bufLen - 1);
  strncpy(deviceId, d.c_str(), bufLen - 1);
  ssid[bufLen - 1] = pass[bufLen - 1] = backend[bufLen - 1] = apiKey[bufLen - 1] = deviceId[bufLen - 1] = '\0';
  return strlen(ssid) > 0;
}

void storageSaveConfig(const char* ssid, const char* pass, const char* backend, const char* apiKey) {
  prefs.putString(KEY_WIFI_SSID, ssid);
  prefs.putString(KEY_WIFI_PASS, pass);
  prefs.putString(KEY_BACKEND, backend);
  prefs.putString(KEY_API_KEY, apiKey);
  LOGI("STORAGE", "Configuration saved");
}

void storageEnsureDeviceId(char* deviceId, size_t bufLen) {
  String d = prefs.getString(KEY_DEVICE_ID, "");
  if (d.length() == 0) {
    uint64_t mac = ESP.getEfuseMac();
    snprintf(deviceId, bufLen, "ESP32-%04X%08X", (uint16_t)(mac >> 32), (uint32_t)mac);
    prefs.putString(KEY_DEVICE_ID, deviceId);
  } else {
    strncpy(deviceId, d.c_str(), bufLen - 1);
    deviceId[bufLen - 1] = '\0';
  }
}

bool storageEnqueueEvent(const QueuedEvent& ev) {
  if (queueCount >= EVENT_QUEUE_SIZE) {
    LOGW("STORAGE", "Event queue full — dropping oldest");
    queueHead = (queueHead + 1) % EVENT_QUEUE_SIZE;
    queueCount--;
  }
  eventQueue[queueTail] = ev;
  eventQueue[queueTail].valid = true;
  queueTail = (queueTail + 1) % EVENT_QUEUE_SIZE;
  queueCount++;
  return true;
}

bool storageDequeueEvent(QueuedEvent& ev) {
  if (queueCount == 0) return false;
  ev = eventQueue[queueHead];
  eventQueue[queueHead].valid = false;
  queueHead = (queueHead + 1) % EVENT_QUEUE_SIZE;
  queueCount--;
  return ev.valid;
}

int storageQueueCount() {
  return queueCount;
}
