/*
 * CYBER-EYE ESP32 Honeypot Firmware
 * Board: ESP32 Dev Module (WROOM-32)
 *
 * Modular honeypot: HTTP, Telnet, SSH, FTP decoy services
 * with backend integration, event queue, and config portal.
 */

#include <Arduino.h>
#include <WiFi.h>
#include <esp_task_wdt.h>
#include <ArduinoOTA.h>

#include "config.h"
#include "logger.h"
#include "storage.h"
#include "wifi.h"
#include "config_portal.h"
#include "api.h"
#include "http_server.h"
#include "telnet_server.h"
#include "ssh_server.h"
#include "ftp_server.h"

static bool servicesStarted = false;

static void setupOTA() {
  ArduinoOTA.setHostname("CyberEye-Honeypot");
  ArduinoOTA.onStart([]() { LOGI("OTA", "Update starting"); });
  ArduinoOTA.onEnd([]() { LOGI("OTA", "Update complete"); });
  ArduinoOTA.onError([](ota_error_t err) { LOGE("OTA", "Error: %u", err); });
  ArduinoOTA.begin();
}

static void startServices() {
  if (servicesStarted) return;
  httpServerInit();
  telnetServerInit();
  sshServerInit();
  ftpServerInit();
  servicesStarted = true;
  LOGI("MAIN", "Decoy services active on ports 21, 22, 23, 80");
}

void setup() {
  loggerInit();
  LOGI("MAIN", "CYBER-EYE Honeypot v%s booting", FIRMWARE_VERSION);

  // ESP32 v2.0.x watchdog API
   esp_task_wdt_init(30, true);
  esp_task_wdt_add(NULL);

  storageInit();
  configInit();
  apiInit();
  wifiInit();

  if (wifiConnect()) {
    setupOTA();
    startServices();
  }
}

void loop() {
  esp_task_wdt_reset();

  configPortalLoop();

  if (configPortalActive()) {
    delay(10);
    return;
  }

  wifiLoop();

  if (wifiIsConnected()) {
    if (!servicesStarted) {
      setupOTA();
      startServices();
    }
    ArduinoOTA.handle();
    apiLoop();
    httpServerLoop();
    telnetServerLoop();
    sshServerLoop();
    ftpServerLoop();
  }

  delay(5);
}
