#include "sed_module.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

// SED device unlock function
int sed_unlock_device(const char *device_path, const char *password) {
    char cmd[512];
    snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-unlock %s %s >/dev/null 2>&1", password, device_path);
    return system(cmd);
}

// SED password change function  
int sed_change_password(const char *device_path, const char *old_pwd, const char *new_pwd) {
    char cmd[512];
    snprintf(cmd, sizeof(cmd), "hdparm --user-master u --security-change %s %s %s >/dev/null 2>&1", old_pwd, new_pwd, device_path);
    return system(cmd);
}

// Advanced SED detection with multiple protocols
int sed_detect_capabilities(const char *device_path, SedCapabilities *caps) {
    memset(caps, 0, sizeof(SedCapabilities));

    // Check ATA security
    if (check_ata_security(device_path, caps)) {
        caps->type = SED_TYPE_ATA;
        return 0;
    }

    // Check NVMe security
    if (check_nvme_security(device_path, caps)) {
        caps->type = SED_TYPE_NVME;
        return 0;
    }

    // Check Opal security
    if (check_opal_security(device_path, caps)) {
        caps->type = SED_TYPE_OPAL;
        return 0;
    }

    return -1; // No SED capabilities found
}

int sed_crypto_erase(const char *device_path, int enhanced) {
    SedCapabilities caps;
    if (sed_detect_capabilities(device_path, &caps) != 0) {
        return -1;
    }

    switch (caps.type) {
        case SED_TYPE_ATA:
            return ata_crypto_erase(device_path, enhanced);
        case SED_TYPE_NVME:
            return nvme_crypto_erase(device_path);
        case SED_TYPE_OPAL:
            return opal_crypto_erase(device_path);
        default:
            return -1;
    }
}

// Advanced ATA crypto erase
int ata_crypto_erase(const char *device_path, int enhanced) {
    char cmd[512];
    
    // Check if drive is frozen
    if (is_drive_frozen(device_path)) {
        fprintf(stderr, "Drive is frozen. Suspending system may be required.\n");
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

    return system(cmd);
}
