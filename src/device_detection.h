// device_detection.h - COMPLETE VERSION
#ifndef DEVICE_DETECTION_H
#define DEVICE_DETECTION_H

#include <stdint.h>
#include <stddef.h> 

// Device types
typedef enum {
    DEVICE_TYPE_HDD,
    DEVICE_TYPE_SSD,
    DEVICE_TYPE_NVME,
    DEVICE_TYPE_USB,
    DEVICE_TYPE_UNKNOWN
} DeviceType;

// Interface types
typedef enum {
    INTERFACE_SATA,
    INTERFACE_NVME,
    INTERFACE_USB,
    INTERFACE_SCSI,
    INTERFACE_UNKNOWN
} InterfaceType;

// SED types
typedef enum {
    SED_TYPE_NONE,
    SED_TYPE_ATA,
    SED_TYPE_NVME,
    SED_TYPE_OPAL,
    SED_TYPE_ENTERPRISE
} SedType;

// Device information structure
typedef struct {
    char device_path[256];
    char model[41];
    char serial[21];
    char firmware[9];
    char wwn[33];
    uint64_t size;
    uint64_t sector_size;
    DeviceType type;
    InterfaceType interface;
    int is_rotational;
    int is_removable;
    int supports_trim;
    int supports_secure_erase;
} DeviceInfo;

// SED capabilities structure
typedef struct {
    char type[20];
    int supports_erase;
    int supports_enhanced_erase;
    int locked;
    int is_frozen;
    char security_version[16];
} SedCapabilities;

// Device detection functions
int device_detection_init();
void device_detection_cleanup();
int get_all_devices(DeviceInfo **devices, int *count);
int get_device_info(const char *device_path, DeviceInfo *info);
int detect_hpa_dco(const char *device_path);
int disable_hpa_dco(const char *device_path);
void print_device_info(const DeviceInfo *info);
int is_device_ssd(const char *device_path);
int get_smart_data(const char *device_path, char *output, size_t output_size);

// SED functions
int sed_detect_capabilities(const char *device_path, SedCapabilities *caps);
int sed_crypto_erase(const char *device_path, int enhanced);
int sed_unlock_device(const char *device_path, const char *password);
int sed_change_password(const char *device_path, const char *old_pwd, const char *new_pwd);
int sed_get_security_status(const char *device_path, char *status, size_t status_size);
const char *sed_type_to_str(const char *type);
int sed_is_supported(const char *device_path);

// Utility functions
const char* device_type_to_str(DeviceType type);
const char* interface_type_to_str(InterfaceType type);

#endif
