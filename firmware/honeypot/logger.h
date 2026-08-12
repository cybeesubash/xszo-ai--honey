#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>

enum LogLevel { LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR };

void loggerInit();
void logMsg(LogLevel level, const char* tag, const char* fmt, ...);

#define LOGD(tag, ...) logMsg(LOG_DEBUG, tag, __VA_ARGS__)
#define LOGI(tag, ...) logMsg(LOG_INFO,  tag, __VA_ARGS__)
#define LOGW(tag, ...) logMsg(LOG_WARN,  tag, __VA_ARGS__)
#define LOGE(tag, ...) logMsg(LOG_ERROR, tag, __VA_ARGS__)

#endif
