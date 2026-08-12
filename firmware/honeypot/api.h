#ifndef API_H
#define API_H

#include "storage.h"

void apiInit();
void apiLoop();
void apiSendEvent(const char* service, const char* ip, int port, const char* protocol,
                  const char* payload, int bytesIn, int bytesOut);

#endif
