#include <stdio.h>
#include <stdlib.h>
#include "../src/device_detection.h"
#include "../src/sed_module.h"

int main() {
    printf("=== Device Detection Test ===\n");
    
    DeviceInfo *devices;
    int count;
    
    if (get_all_devices(&devices, &count) == 0) {
        for (int i = 0; i < count; i++) {
            printf("Device %d: %s\n", i+1, devices[i].device_path);
            printf("  Size: %lu bytes\n", devices[i].size);
            
            SedCapabilities caps;  // ← YE EK HI BAAR DECLARE KARO
            if (sed_detect_capabilities(devices[i].device_path, &caps) == 0) {
                printf("  SED Type: %s\n", sed_type_to_str(caps.type));
                printf("  Supports Erase: %s\n", caps.supports_erase ? "Yes" : "No");
            } else {
                printf("  SED: Not supported\n");
            }
            printf("\n");
        }
        free(devices);
    }
    
    return 0;
}