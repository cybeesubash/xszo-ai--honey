#include <WiFi.h>
#include <WebServer.h>
#include "config_portal.h"
#include "config.h"
#include "logger.h"
#include "storage.h"

static WebServer portalServer(80);
static bool portalRunning = false;

static const char PORTAL_HTML[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CYBER-EYE Setup</title>
<style>body{font-family:sans-serif;background:#0f172a;color:#e2e8f0;max-width:420px;margin:40px auto;padding:20px}
h2{color:#38bdf8}label{display:block;margin:12px 0 4px;font-size:13px}input{width:100%;padding:8px;border:1px solid #334155;border-radius:6px;background:#1e293b;color:#fff;box-sizing:border-box}
button{margin-top:16px;width:100%;padding:10px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600}
button:hover{background:#1d4ed8}</style></head><body>
<h2>CYBER-EYE Honeypot Setup</h2>
<form method="POST" action="/save">
<label>WiFi SSID</label><input name="ssid" required maxlength="63">
<label>WiFi Password</label><input name="pass" type="password" maxlength="63">
<label>Backend URL (e.g. http://192.168.1.50:8000)</label><input name="backend" required maxlength="127">
<label>API Key</label><input name="apikey" required maxlength="127">
<button type="submit">Save &amp; Reboot</button>
</form></body></html>
)rawliteral";

static void handleRoot() {
  portalServer.send(200, "text/html", PORTAL_HTML);
}

static void handleSave() {
  if (!portalServer.hasArg("ssid") || !portalServer.hasArg("backend") || !portalServer.hasArg("apikey")) {
    portalServer.send(400, "text/plain", "Missing fields");
    return;
  }
  String ssid = portalServer.arg("ssid");
  String pass = portalServer.arg("pass");
  String backend = portalServer.arg("backend");
  String apikey = portalServer.arg("apikey");
  storageSaveConfig(ssid.c_str(), pass.c_str(), backend.c_str(), apikey.c_str());
  portalServer.send(200, "text/html", "<html><body style='background:#0f172a;color:#e2e8f0;font-family:sans-serif;text-align:center;padding:40px'><h2>Saved!</h2><p>Rebooting...</p></body></html>");
  delay(1000);
  ESP.restart();
}

void configPortalStart() {
  if (portalRunning) return;
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  LOGI("PORTAL", "AP started: %s at %s", AP_SSID, AP_IP);

  portalServer.on("/", HTTP_GET, handleRoot);
  portalServer.on("/save", HTTP_POST, handleSave);
  portalServer.begin();
  portalRunning = true;
}

void configPortalLoop() {
  if (portalRunning) portalServer.handleClient();
}

bool configPortalActive() {
  return portalRunning;
}
