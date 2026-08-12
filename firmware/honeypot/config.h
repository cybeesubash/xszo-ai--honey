#ifndef CONFIG_H
#define CONFIG_H

// Firmware version reported to backend
#define FIRMWARE_VERSION "2.0.0"

// AP config portal
#define AP_SSID           "HoneyBot_Setup"
#define AP_PASSWORD       ""          // Open AP for easy setup
#define AP_IP             "192.168.4.1"

// Timing
#define HEARTBEAT_INTERVAL_MS  30000
#define WIFI_RECONNECT_MS      15000
#define CLIENT_TIMEOUT_MS      8000
#define MAX_PAYLOAD_SIZE       2048
#define EVENT_QUEUE_SIZE       16

// Backend paths (base URL stored in Preferences)
#define PATH_REGISTER   "/device/register"
#define PATH_HEARTBEAT  "/device/heartbeat"
#define PATH_EVENT      "/api/event"

// Preferences namespace keys
#define PREF_NAMESPACE  "cyber-eye"
#define KEY_WIFI_SSID   "wifi_ssid"
#define KEY_WIFI_PASS   "wifi_pass"
#define KEY_BACKEND     "backend_url"
#define KEY_API_KEY     "api_key"
#define KEY_DEVICE_ID   "device_id"

// Runtime config (config.cpp)
void configInit();
const char* configBackendUrl();
const char* configApiKey();
const char* configDeviceId();

#endif
