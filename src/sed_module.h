#ifndef SED_MODULE_H
#define SED_MODULE_H

#include "device_detection.h"

typedef enum {
    SED_TYPE_NONE,
    SED_TYPE_ATA,
    SED_TYPE_NVME,
    SED_TYPE_OPAL,
    SED_TYPE_ENTERPRISE
} SedType;

typedef struct {
    SedType type;
    int supports_erase;
    int supports_enhanced_erase;
    int is_locked;
    int is_frozen;
    char security_version[16];
} SedCapabilities;

// Advanced SED functions
int sed_detect_capabilities(const char *device_path, SedCapabilities *caps);
int sed_crypto_erase(const char *device_path, int enhanced);
int sed_unlock_device(const char *device_path, const char *password);
int sed_change_password(const char *device_path, const char *old_pwd, const char *new_pwd);
int sed_get_security_status(const char *device_path, char *status, size_t status_size);

// Utility functions
const char* sed_type_to_str(SedType type);
int sed_is_supported(const char *device_path);

#endif