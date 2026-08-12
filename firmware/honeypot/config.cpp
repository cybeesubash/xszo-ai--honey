#include "config.h"
#include "storage.h"

static char gBackend[128];
static char gApiKey[128];
static char gDeviceId[48];
static char gSsid[64];
static char gPass[64];

void configInit() {
  storageLoadConfig(gSsid, gPass, gBackend, gApiKey, gDeviceId, 64);
  storageEnsureDeviceId(gDeviceId, sizeof(gDeviceId));
}

const char* configBackendUrl() { return gBackend; }
const char* configApiKey() { return gApiKey; }
const char* configDeviceId() { return gDeviceId; }
