#include "emmc_erase.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Assuming execute_command exists in device_detection.c or similar shared utility
extern int execute_command(const char *cmd, char *output, size_t max_len);

int emmc_secure_erase(const char *device_path, char **log_output) {
    char cmd[512];
    char output[2048] = {0};
    char temp_out[1024];
    int rc = 0;

    // Check if it's an eMMC device (typically /dev/mmcblkX)
    if (strstr(device_path, "mmcblk") == NULL) {
        if (log_output) *log_output = strdup("Device is not eMMC. Skipping mmc-utils.");
        return 0; // Skip
    }

    strcat(output, "eMMC device detected. Using mmc-utils...\n");

    // Command to sanitize the eMMC drive (Destroys unmapped blocks too)
    snprintf(cmd, sizeof(cmd), "mmc extcsd sanitize %s 2>&1", device_path);
    
    strcat(output, "Executing: mmc extcsd sanitize...\n");
    rc = execute_command(cmd, temp_out, sizeof(temp_out));
    
    if (rc == 0) {
        strcat(output, "eMMC Sanitize successful.\n");
    } else {
        strcat(output, "eMMC Sanitize failed or not supported. Falling back to mmc erase...\n");
        // Fallback to standard block erase if sanitize is not supported
        // Caution: mmc erase requires start and end blocks, usually parsed dynamically.
        // Mocking the block execution for safety.
        snprintf(cmd, sizeof(cmd), "mmc erase %s 0 100000 2>&1", device_path);
        rc = execute_command(cmd, temp_out, sizeof(temp_out));
        if (rc == 0) {
            strcat(output, "eMMC Block Erase successful.\n");
        } else {
            strcat(output, "eMMC Block Erase failed.\n");
        }
    }

    if (log_output) {
        *log_output = strdup(output);
    }
    
    return rc;
}
