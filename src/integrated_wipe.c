
#include "integrated_wipe.h"
#include "device_detection.h"
#include "hardware_erase.h"
#include "crypto_wipe.h"
#include "emmc_erase.h"
#include "json_logger.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int perform_integrated_wipe(const char *device_path, const char *log_file) {
    DeviceInfo info;
    if (get_device_info(device_path, &info) != 0) {
        return -1; // Device info failed
    }
    
    char *log_output = NULL;
    int result;
    const char *method;
    
    printf("Analyzing device: %s\n", device_path);
    /* BUG FIX: is_rotational==1 means HDD, is_rotational==0 means SSD */
    printf("Size: %lu bytes, Type: %s\n", info.size, info.is_rotational ? "HDD" : "SSD");

    // 1. First try SED crypto erase (fastest — hardware-native key discard)
    SedCapabilities caps;
    if (sed_detect_capabilities(device_path, &caps) == 0 && caps.supports_erase) {
        method = "SED_CRYPTO_ERASE";
        printf("Using SED cryptographic erase...\n");
        result = sed_crypto_erase(device_path, 1);
    }
    // 2. eMMC sanitize (for mmcblk devices like SD cards and embedded storage)
    else if (strstr(device_path, "mmcblk") != NULL) {
        method = "EMMC_SANITIZE";
        printf("Using eMMC sanitize erase...\n");
        result = emmc_secure_erase(device_path, &log_output);
    }
    // 3. Hardware ATA/NVMe Secure Erase for HDDs (rotational drives)
    /*
     * BUG FIX: was `!info.is_rotational` which incorrectly sent HDDs through
     * software crypto wipe and SSDs through hardware erase. Corrected:
     *   - Rotational (HDD)  -> hardware_secure_erase (ATA Secure Erase via hdparm)
     *   - Non-rotational (SSD without SED) -> crypto_wipe_device
     */
    else if (info.is_rotational) {
        method = "HARDWARE_SECURE_ERASE";
        printf("Using hardware ATA secure erase (HDD)...\n");
        result = hardware_secure_erase(device_path, &log_output);
    }
    // 4. Software Crypto Wipe for SSDs without SED support
    else {
        method = "SOFTWARE_CRYPTO_WIPE";
        printf("Using software cryptographic wipe (SSD without SED)...\n");
        result = crypto_wipe_device(device_path, &log_output);
    }
    
    // Generate and save JSON log
    char *json_log = generate_wipe_json_log(device_path, method, result == 0, 
                                          log_output ? log_output : "");
    
    if (log_file) {
        save_json_log(json_log, log_file);
    }
    
    // Cleanup
    free(json_log);
    if (log_output) free(log_output);
    
    return result;
}
