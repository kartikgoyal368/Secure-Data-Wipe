#include "sed_module.h"
#include "device_detection.h"
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

/*
 * sanitize_shell_arg: Returns 1 if the string is safe to embed in a shell
 * command (only alnum, '/', '.', '-', '_' allowed). Returns 0 otherwise.
 * BUG FIX: prevents shell command injection when passwords or paths are
 * passed directly into snprintf(cmd, ...) strings.
 */
static int sanitize_shell_arg(const char *arg) {
    if (!arg) return 0;
    for (const char *p = arg; *p; p++) {
        if (!((*p >= 'a' && *p <= 'z') ||
              (*p >= 'A' && *p <= 'Z') ||
              (*p >= '0' && *p <= '9') ||
              *p == '/' || *p == '.' ||
              *p == '-' || *p == '_')) {
            return 0; // Potentially dangerous character
        }
    }
    return 1;
}

int sed_unlock_device(const char *device_path, const char *password) {
    /*
     * BUG FIX: validate both arguments before interpolating into shell command
     * to prevent injection (e.g. password = "x; rm -rf /").
     */
    if (!sanitize_shell_arg(device_path) || !sanitize_shell_arg(password)) {
        fprintf(stderr, "sed_unlock_device: unsafe argument rejected\n");
        return -1;
    }
    char cmd[512];
    snprintf(cmd, sizeof(cmd),
             "hdparm --user-master u --security-unlock %s %s >/dev/null 2>&1",
             password, device_path);
    return system(cmd);
}

int sed_change_password(const char *device_path, const char *old_pwd, const char *new_pwd) {
    /*
     * BUG FIX: validate all three arguments before interpolating.
     */
    if (!sanitize_shell_arg(device_path) ||
        !sanitize_shell_arg(old_pwd)     ||
        !sanitize_shell_arg(new_pwd)) {
        fprintf(stderr, "sed_change_password: unsafe argument rejected\n");
        return -1;
    }
    char cmd[512];
    snprintf(cmd, sizeof(cmd),
             "hdparm --user-master u --security-change %s %s %s >/dev/null 2>&1",
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
            snprintf(cmd, sizeof(cmd),
                     "hdparm --user-master u --security-erase-enhanced NULL %s >/dev/null 2>&1",
                     device_path);
        } else {
            snprintf(cmd, sizeof(cmd),
                     "hdparm --user-master u --security-erase NULL %s >/dev/null 2>&1",
                     device_path);
        }
    }
    
    return system(cmd);
}
