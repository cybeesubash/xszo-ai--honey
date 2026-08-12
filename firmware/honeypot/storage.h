#ifndef STORAGE_H
#define STORAGE_H

#include <stddef.h>
#include "config.h"

struct QueuedEvent {
  char device[48];
  char service[16];
  char ip[46];
  int port;
  char protocol[12];
  char payload[MAX_PAYLOAD_SIZE];
  int bytesIn;
  int bytesOut;
  unsigned long timestamp;
  bool valid;
};

void storageInit();
bool storageLoadConfig(char* ssid, char* pass, char* backend, char* apiKey, char* deviceId, size_t bufLen);
void storageSaveConfig(const char* ssid, const char* pass, const char* backend, const char* apiKey);
void storageEnsureDeviceId(char* deviceId, size_t bufLen);

bool storageEnqueueEvent(const QueuedEvent& ev);
bool storageDequeueEvent(QueuedEvent& ev);
int  storageQueueCount();

#endif
