#ifndef JSON_LOGGER_H
#define JSON_LOGGER_H

char* generate_wipe_json_log(const char *device_path, const char *method, 
                           int success, const char *output);
int save_json_log(const char *log_content, const char *filename);

#endif