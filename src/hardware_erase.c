#include "hardware_erase.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int unlock_hidden_areas(const char *device_path, char **log_output) {
    char cmd[512];
    char output[2048] = {0};
    char temp_out[1024];
    int rc = 0;

    // Only applies to SATA/ATA drives usually, but we check generically
    if (strstr(device_path, "nvme") != NULL) {
        if (log_output) *log_output = strdup("Hidden area unlock not applicable for NVMe via hdparm.");
        return 0; // Skip for NVMe
    }

    strcat(output, "Checking HPA/DCO...\n");

    // Attempt to restore DCO (Device Configuration Overlay)
    snprintf(cmd, sizeof(cmd), "hdparm --yes-i-know-what-i-am-doing --dco-restore %s 2>&1", device_path);
    rc = execute_command(cmd, temp_out, sizeof(temp_out));
    strcat(output, temp_out);

    // Attempt to unlock HPA (Host Protected Area) by setting max sectors
    // Note: In a real environment, we'd parse the max native sectors first, 
    // but a common trick is to pass an overly large number or read native max.
    // We will just log the attempt for now as a placeholder for the exact ATA commands.
    snprintf(cmd, sizeof(cmd), "hdparm -N %s 2>&1", device_path);
    execute_command(cmd, temp_out, sizeof(temp_out));
    strcat(output, temp_out);
    
    if (strstr(temp_out, "HPA is enabled")) {
        // Needs to be disabled
        strcat(output, "\nHPA detected. Attempting to disable...\n");
        // (Placeholder for actual max sector parse & disable)
    }

    if (log_output) {
        *log_output = strdup(output);
    }
    
    return rc;
}

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
        if (strstr(output, "frozen") != NULL) {
            printf("WARNING: Drive is FROZEN. Attempting RTCWake Bypass to drop BIOS lock...\n");
            
            // Execute RTCWake to suspend to RAM for 3 seconds, then wake up
            execute_command("rtcwake -m mem -s 3 2>&1", output, sizeof(output));
            printf("RTCWake cycle complete. Re-checking freeze status...\n");
            
            // Re-check frozen status
            execute_command(cmd, output, sizeof(output));
            
            if (strstr(output, "frozen") != NULL) {
                printf("CRITICAL ERROR: Drive is still frozen after RTCWake cycle. Cannot proceed with ATA Secure Erase.\n");
                if (log_output) *log_output = strdup("Drive frozen. RTCWake bypass failed.");
                return -1;
            } else {
                printf("RTCWake Bypass Successful! Drive is no longer frozen.\n");
            }
        } else if (rc != 0) {
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