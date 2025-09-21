#ifndef SED_MODULE_H
#define SED_MODULE_H

#include <stddef.h>  // ADD THIS LINE

// SED module function declarations
int sed_unlock_device(const char *device_path, const char *password);
int sed_change_password(const char *device_path, const char *old_pwd, const char *new_pwd);
int sed_get_security_status(const char *device_path, char *status, size_t status_size);
int sed_is_supported(const char *device_path);

#endif
