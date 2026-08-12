#include <WiFi.h>
#include <WebServer.h>
#include "http_server.h"
#include "api.h"
#include "logger.h"

// Use the ESP32 WebServer implementation instead of writing HTTP frames by
// hand. It handles browser keep-alive, headers, and clean connection closes.
static WebServer httpServer(80);

static const char LOGIN_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Enterprise Router Login</title>
<style>body{font-family:Arial,sans-serif;background:#1a1a2e;color:#eee;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.box{background:#16213e;padding:32px;border-radius:8px;width:320px;box-shadow:0 4px 20px rgba(0,0,0,.4)}h2{margin:0 0 20px;font-size:18px;color:#e94560}input{width:100%;padding:10px;margin:6px 0;border:1px solid #0f3460;border-radius:4px;background:#0f3460;color:#fff;box-sizing:border-box}button{width:100%;padding:10px;margin-top:12px;background:#e94560;color:#fff;border:0;border-radius:4px;cursor:pointer;font-weight:bold}</style></head>
<body><div class="box"><h2>Enterprise Router Login</h2><form method="POST" action="/login"><input name="username" placeholder="Username" required><input name="password" type="password" placeholder="Password" required><button type="submit">Sign In</button></form></div></body></html>
)rawliteral";

static const char INVALID_PAGE[] PROGMEM = R"rawliteral(
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Authentication Failed</title></head><body style="font-family:Arial,sans-serif;background:#1a1a2e;color:#ff6b6b;text-align:center;padding:60px"><h2>Invalid Username or Password</h2><p>Please return to the login page and try again.</p></body></html>
)rawliteral";

static String requestSummary(const char* method) {
  String payload = String(method) + " " + httpServer.uri() + " HTTP/1.1\r\n";
  for (uint8_t i = 0; i < httpServer.args(); ++i) {
    payload += httpServer.argName(i) + "=" + httpServer.arg(i) + "\r\n";
  }
  return payload;
}

static void handleLoginPage() {
  String ip = httpServer.client().remoteIP().toString();
  String payload = requestSummary("GET");
  LOGI("HTTP", "Connection from %s", ip.c_str());
  httpServer.send(200, "text/html; charset=utf-8", LOGIN_PAGE);
  apiSendEvent("http", ip.c_str(), 80, "tcp", payload.c_str(), payload.length(), 800);
}

static void handleLoginSubmit() {
  String ip = httpServer.client().remoteIP().toString();
  String payload = requestSummary("POST");
  LOGI("HTTP", "Login submission from %s", ip.c_str());
  httpServer.send(401, "text/html; charset=utf-8", INVALID_PAGE);
  apiSendEvent("http", ip.c_str(), 80, "tcp", payload.c_str(), payload.length(), 200);
}

void httpServerInit() {
  httpServer.on("/", HTTP_GET, handleLoginPage);
  httpServer.on("/login", HTTP_POST, handleLoginSubmit);
  httpServer.onNotFound(handleLoginPage);
  httpServer.begin();
  LOGI("HTTP", "Fake Enterprise Router listening on port 80");
}

void httpServerLoop() {
  httpServer.handleClient();
}
