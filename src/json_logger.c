#include "json_logger.h"
#include "utils.h"
#include <time.h>
#include <stdio.h>
#include <stdlib.h>

char* generate_wipe_json_log(const char *device_path, const char *method, 
                           int success, const char *output) {
    time_t now = time(NULL);
    char timestamp[64];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", gmtime(&now));
    
    char *json_log;
    asprintf(&json_log,
        "{\n"
        "  \"device\": \"%s\",\n"
        "  \"method\": \"%s\",\n"
        "  \"timestamp\": \"%s\",\n"
        "  \"success\": %s,\n"
        "  \"output\": \"%s\"\n"
        "}",
        device_path,
        method,
        timestamp,
        success ? "true" : "false",
        output ? output : ""
    );
    
    return json_log;
}

int save_json_log(const char *log_content, const char *filename) {
    FILE *f = fopen(filename, "w");
    if (!f) return -1;
    
    fprintf(f, "%s\n", log_content);
    fclose(f);
    return 0;
}