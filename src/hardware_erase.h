#ifndef HARDWARE_ERASE_H
#define HARDWARE_ERASE_H

// Hardware-based secure erase functions
int hardware_secure_erase(const char *device_path, char **log_output);

#endif