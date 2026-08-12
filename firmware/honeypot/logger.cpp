#include "logger.h"
#include <stdarg.h>

static const char* LEVEL_STR[] = { "DBG", "INF", "WRN", "ERR" };

void loggerInit() {
  Serial.begin(115200);
  delay(500);
}

void logMsg(LogLevel level, const char* tag, const char* fmt, ...) {
  char buf[256];
  va_list args;
  va_start(args, fmt);
  vsnprintf(buf, sizeof(buf), fmt, args);
  va_end(args);
  Serial.printf("[%s][%s] %s\n", LEVEL_STR[level], tag, buf);
}
