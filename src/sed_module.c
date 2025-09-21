#include "sed_module.h"
#include "device_detection.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

// SED Type Constants
#define SED_TYPE_ATA "ATA"
#define SED_TYPE_NVME "NVMe" 
#define SED_TYPE_OPAL "Opal"
#define SED_TYPE_UNKNOWN "Unknown"

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

int is_drive_frozen(const char *device_path) {
    char cmd[256];
    char output[128];
    
    snprintf(cmd, sizeof(cmd), "hdparm -I %s 2>/dev/null | grep -i 'frozen'", device_path);
    if (execute_command(cmd, output, sizeof(output)) == 0) {
        // If we find "frozen" and it's NOT "not frozen", then it's frozen
        if (strstr(output, "frozen") && !strstr(output, "not")) {
            return 1; // Frozen
        }
    }
    return 0; // Not frozen
}

int check_ata_security(const char *device_path, SedCapabilities *caps) {
    char cmd[256];
    char output[512];
    
    // Check for ATA security support
    snprintf(cmd, sizeof(cmd), "hdparm -I %s 2>/dev/null", device_path);
    if (execute_command(cmd, output, sizeof(output)) == 0) {
        if (strstr(output, "supported:") && strstr(output, "enhanced")) {
            strcpy(caps->type, SED_TYPE_ATA);
            caps->supports_erase = 1;
            
            // Check if locked
            if (strstr(output, "locked") && !strstr(output, "not")) {
                caps->locked = 1;
            }
            return 1;
        }
    }
    return 0;
}

int check_nvme_security(const char *device_path, SedCapabilities *caps) {
    if (strstr(device_path, "nvme") == NULL) {
        return 0;
    }
    
    char cmd[256];
    char output[256];
    
    snprintf(cmd, sizeof(cmd), "nvme id-ctrl %s 2>/dev/null", device_path);
    if (execute_command(cmd, output, sizeof(output)) == 0) {
        if (strstr(output, "OPAL") || strstr(output, "Crypto")) {
            strcpy(caps->type, SED_TYPE_NVME);
            caps->supports_erase = 1;
            return 1;
        }
    }
    return 0;
}

int check_opal_security(const char *device_path, SedCapabilities *caps) {
    // Try to use sedutil if available
    char cmd[256];
    char output[256];
    
    snprintf(cmd, sizeof(cmd), "which sedutil-cli 2>/dev/null");
    if (execute_command(cmd, output, sizeof(output)) != 0) {
        return 0; // sedutil not available
    }
    
    snprintf(cmd, sizeof(cmd), "sedutil-cli --query %s 2>/dev/null", device_path);
    if (execute_command(cmd, output, sizeof(output)) == 0) {
        if (strstr(output, "OPAL")) {
            strcpy(caps->type, SED_TYPE_OPAL);
            caps->supports_erase = 1;
            return 1;
        }
    }
    return 0;
}

int sed_detect_capabilities(const char *device_path, SedCapabilities *caps) {
    memset(caps, 0, sizeof(SedCapabilities));
    strcpy(caps->type, SED_TYPE_UNKNOWN);
    caps->supports_erase = 0;
    caps->locked = 0;

    // Check NVMe first (most specific)
    if (check_nvme_security(device_path, caps)) {
        return 0;
    }

    // Check ATA security
    if (check_ata_security(device_path, caps)) {
        return 0;
    }

    // Check Opal security
    if (check_opal_security(device_path, caps)) {
        return 0;
    }

    return -1; // No SED capabilities found
}

int ata_crypto_erase(const char *device_path, int enhanced) {
    char cmd[512];
    
    // Check if drive is frozen
    if (is_drive_frozen(device_path)) {
        fprintf(stderr, "Drive is frozen. Try: echo -n mem > /sys/power/state\n");
        return -1;
    }

    // Set NULL password
    snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-set-pass NULL %s >/dev/null 2>&1", device_path);
    if (system(cmd) != 0) {
        return -1;
    }

    // Perform erase
    if (enhanced) {
        snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-erase-enhanced NULL %s >/dev/null 2>&1", device_path);
    } else {
        snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-erase NULL %s >/dev/null 2>&1", device_path);
    }

    int result = system(cmd);
    
    // Clear password regardless of result
    snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-disable NULL %s >/dev/null 2>&1", device_path);
    system(cmd);
    
    return result;
}

int nvme_crypto_erase(const char *device_path) {
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "nvme format %s -s 1 >/dev/null 2>&1", device_path);
    return system(cmd);
}

int opal_crypto_erase(const char *device_path) {
    char cmd[256];
    char output[256];
    
    // Check if sedutil is available
    snprintf(cmd, sizeof(cmd), "which sedutil-cli 2>/dev/null");
    if (execute_command(cmd, output, sizeof(output)) != 0) {
        fprintf(stderr, "Install sedutil-cli for Opal support: sudo apt install sedutil\n");
        return -1;
    }
    
    snprintf(cmd, sizeof(cmd), "sedutil-cli --yesIreallywanttoERASEALLmydatausingthePSID %s", device_path);
    return system(cmd);
}

int sed_crypto_erase(const char *device_path, int enhanced) {
    SedCapabilities caps;
    if (sed_detect_capabilities(device_path, &caps) != 0) {
        fprintf(stderr, "No SED capabilities detected\n");
        return -1;
    }

    printf("Using %s crypto erase...\n", caps.type);

    if (strcmp(caps.type, SED_TYPE_ATA) == 0) {
        return ata_crypto_erase(device_path, enhanced);
    } else if (strcmp(caps.type, SED_TYPE_NVME) == 0) {
        return nvme_crypto_erase(device_path);
    } else if (strcmp(caps.type, SED_TYPE_OPAL) == 0) {
        return opal_crypto_erase(device_path);
    }
    
    return -1;
}

const char *sed_type_to_str(const char *type) {
    if (strcmp(type, SED_TYPE_ATA) == 0) return "ATA Security";
    if (strcmp(type, SED_TYPE_NVME) == 0) return "NVMe Security";
    if (strcmp(type, SED_TYPE_OPAL) == 0) return "Opal Security";
    return "Unknown";
}