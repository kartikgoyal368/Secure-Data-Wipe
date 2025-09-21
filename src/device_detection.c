#include "device_detection.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dirent.h>

const char* device_type_to_str(DeviceType type) {
    switch (type) {
        case DEVICE_TYPE_HDD: return "HDD";
        case DEVICE_TYPE_SSD: return "SSD";
        case DEVICE_TYPE_NVME: return "NVMe SSD";
        case DEVICE_TYPE_USB: return "USB Storage";
        default: return "Unknown";
    }
}

const char* interface_type_to_str(InterfaceType type) {
    switch (type) {
        case INTERFACE_SATA: return "SATA";
        case INTERFACE_NVME: return "NVMe";
        case INTERFACE_USB: return "USB";
        case INTERFACE_SCSI: return "SCSI";
        default: return "Unknown";
    }
}

int device_detection_init() {
    // Initialize any required resources
    return 0;
}

void device_detection_cleanup() {
    // Cleanup any resources
}

int get_all_devices(DeviceInfo **devices, int *count) {
    // Simple implementation to detect block devices
    DIR *dir;
    struct dirent *entry;
    DeviceInfo *dev_list = NULL;
    int dev_count = 0;
    int capacity = 10;
    
    dev_list = malloc(capacity * sizeof(DeviceInfo));
    if (!dev_list) return -1;
    
    dir = opendir("/sys/block");
    if (!dir) {
        free(dev_list);
        return -1;
    }
    
    while ((entry = readdir(dir)) != NULL) {
        if (entry->d_name[0] == '.') continue;
        
        // Skip virtual devices
        if (strstr(entry->d_name, "loop") || strstr(entry->d_name, "ram")) continue;
        
        if (dev_count >= capacity) {
            capacity *= 2;
            DeviceInfo *temp = realloc(dev_list, capacity * sizeof(DeviceInfo));
            if (!temp) {
                free(dev_list);
                closedir(dir);
                return -1;
            }
            dev_list = temp;
        }
        
        // Create device path
        snprintf(dev_list[dev_count].device_path, sizeof(dev_list[dev_count].device_path), 
                 "/dev/%s", entry->d_name);
        
        // Set default values
        strcpy(dev_list[dev_count].model, "Unknown");
        strcpy(dev_list[dev_count].serial, "Unknown");
        strcpy(dev_list[dev_count].firmware, "Unknown");
        dev_list[dev_count].size = 0;
        dev_list[dev_count].is_rotational = 1; // Assume HDD by default
        dev_list[dev_count].is_removable = 0;
        dev_list[dev_count].supports_trim = 0;
        dev_list[dev_count].supports_secure_erase = 0;
        
        // Detect device type
        if (strstr(entry->d_name, "nvme")) {
            dev_list[dev_count].type = DEVICE_TYPE_NVME;
            dev_list[dev_count].interface = INTERFACE_NVME;
            dev_list[dev_count].is_rotational = 0;
        } else if (strstr(entry->d_name, "sd") || strstr(entry->d_name, "hd")) {
            // Check if it's SSD by looking at rotational flag
            char path[256];
            snprintf(path, sizeof(path), "/sys/block/%s/queue/rotational", entry->d_name);
            
            FILE *f = fopen(path, "r");
            if (f) {
                int rotational;
                fscanf(f, "%d", &rotational);
                fclose(f);
                
                dev_list[dev_count].is_rotational = rotational;
                dev_list[dev_count].type = rotational ? DEVICE_TYPE_HDD : DEVICE_TYPE_SSD;
                dev_list[dev_count].interface = INTERFACE_SATA;
            }
        }
        
        dev_count++;
    }
    
    closedir(dir);
    
    *devices = dev_list;
    *count = dev_count;
    return 0;
}

int get_device_info(const char *device_path, DeviceInfo *info) {
    // Basic implementation - extract device name from path
    const char *dev_name = strrchr(device_path, '/');
    if (!dev_name) return -1;
    dev_name++; // Skip the '/'
    
    memset(info, 0, sizeof(DeviceInfo));
    strncpy(info->device_path, device_path, sizeof(info->device_path) - 1);
    
    // Set basic info based on device name
    if (strstr(dev_name, "nvme")) {
        info->type = DEVICE_TYPE_NVME;
        info->interface = INTERFACE_NVME;
        info->is_rotational = 0;
    } else {
        info->type = DEVICE_TYPE_HDD;
        info->interface = INTERFACE_SATA;
        info->is_rotational = 1;
    }
    
    return 0;
}

// Placeholder SED functions
int sed_detect_capabilities(const char *device_path, SedCapabilities *caps) {
    memset(caps, 0, sizeof(SedCapabilities));
    strcpy(caps->type, "UNKNOWN");
    caps->supports_erase = 0;
    caps->locked = 0;
    return -1; // Not supported
}

const char *sed_type_to_str(const char *type) {
    if (strcmp(type, "OPAL") == 0) return "Opal";
    if (strcmp(type, "PYRITE") == 0) return "Pyrite";
    if (strcmp(type, "RUBY") == 0) return "Ruby";
    return type;
}