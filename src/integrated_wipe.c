#include "integrated_wipe.h"
#include "device_detection.h"
#include "sed_module.h"
#include "hardware_erase.h"
#include "crypto_wipe.h"
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
    printf("Size: %lu bytes, Type: %s\n", info.size, info.is_rotational ? "SSD" : "HDD");

    // 1. First try SED crypto erase
    SedCapabilities caps;
    if (sed_detect_capabilities(device_path, &caps) == 0 && caps.supports_erase) {
        method = "SED_CRYPTO_ERASE";
        printf("Using SED cryptographic erase...\n");
        result = sed_crypto_erase(device_path, 1);
    } 
    // 2. Then try hardware secure erase
    else if (!info.is_rotational) {  // Hardware erase better for HDDs
        method = "HARDWARE_SECURE_ERASE";
        printf("Using hardware secure erase...\n");
        result = hardware_secure_erase(device_path, &log_output);
    }
    // 3. Then try crypto wipe (for SSDs without SED)
    else if (info.is_rotational) {
        method = "SOFTWARE_CRYPTO_WIPE";
        printf("Using software cryptographic wipe...\n");
        result = crypto_wipe_device(device_path, &log_output);
    }
    // 4. Fallback to basic overwrite
    else {
        method = "OVERWRITE";
        printf("Using basic overwrite...\n");
        // You'd implement basic overwrite here
        result = -1; // Placeholder
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