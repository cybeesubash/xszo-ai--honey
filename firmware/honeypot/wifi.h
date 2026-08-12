#ifndef WIFI_MGR_H
#define WIFI_MGR_H

void wifiInit();
bool wifiConnect();
bool wifiIsConnected();
void wifiLoop();
const char* wifiLocalIP();
int wifiRSSI();

#endif
