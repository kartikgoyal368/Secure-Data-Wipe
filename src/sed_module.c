#include "sed_module.h"
#include "device_detection.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

int sed_unlock_device(const char *device_path, const char *password) {
    char cmd[512];
    snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-unlock %s %s >/dev/null 2>&1", 
             password, device_path);
    return system(cmd);
}

int sed_change_password(const char *device_path, const char *old_pwd, const char *new_pwd) {
    char cmd[512];
    snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-change %s %s %s >/dev/null 2>&1", 
             old_pwd, new_pwd, device_path);
    return system(cmd);
}

int sed_get_security_status(const char *device_path, char *status, size_t status_size) {
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "hdparm -I %s 2>/dev/null | grep -i security", device_path);
    return execute_command(cmd, status, status_size);
}

int sed_is_supported(const char *device_path) {
    SedCapabilities caps;
    return (sed_detect_capabilities(device_path, &caps) == 0 && caps.supports_erase);
}

int sed_crypto_erase(const char *device_path, int enhanced) {
    char cmd[512];
    
    if (strstr(device_path, "nvme")) {
        // NVMe crypto erase
        snprintf(cmd, sizeof(cmd), "nvme format %s -s 1 >/dev/null 2>&1", device_path);
    } else {
        // ATA crypto erase
        if (enhanced) {
            snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-erase-enhanced NULL %s >/dev/null 2>&1", device_path);
        } else {
            snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-erase NULL %s >/dev/null 2>&1", device_path);
        }
    }
    
    return system(cmd);
}
