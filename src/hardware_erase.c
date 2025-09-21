#include "hardware_erase.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int hardware_secure_erase(const char *device_path, char **log_output) {
    char cmd[512];
    char output[1024];
    int rc;
    
    // Check if NVMe or SATA
    int is_nvme = (strstr(device_path, "nvme") != NULL);
    
    if (is_nvme) {
        // NVMe secure erase
        snprintf(cmd, sizeof(cmd), "nvme format %s -s 1 2>&1", device_path);
        rc = execute_command(cmd, output, sizeof(output));
        
        if (log_output) {
            *log_output = strdup(output);
        }
        
        return rc;
    } else {
        // SATA secure erase using hdparm
        // Step 1: Check if frozen
        char frozen_check[256];
        snprintf(cmd, sizeof(cmd), "hdparm -I %s 2>&1 | grep -i frozen", device_path);
        execute_command(cmd, frozen_check, sizeof(frozen_check));
        
        if (strstr(frozen_check, "frozen")) {
            if (log_output) {
                *log_output = strdup("Device is frozen - cannot perform secure erase");
            }
            return -2; // Frozen error code
        }
        
        // Step 2: Set password
        snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-set-pass NULL %s 2>&1", device_path);
        rc = execute_command(cmd, output, sizeof(output));
        if (rc != 0) {
            if (log_output) *log_output = strdup(output);
            return rc;
        }
        
        // Step 3: Perform erase
        snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-erase NULL %s 2>&1", device_path);
        rc = execute_command(cmd, output, sizeof(output));
        
        if (log_output) {
            *log_output = strdup(output);
        }
        
        return rc;
    }
}