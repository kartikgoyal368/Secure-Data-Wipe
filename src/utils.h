#ifndef UTILS_H
#define UTILS_H

#include <stdint.h>
#include <stddef.h>

// Function prototypes
int execute_command(const char *cmd, char *output, size_t output_size);
int is_valid_device_path(const char *path);
int64_t get_current_timestamp();
char* format_timestamp(int64_t timestamp);
int is_nvme_device(const char *device_path);
int is_usb_device(const char *device_path);
uint64_t get_device_size(const char *device_path);
int get_device_sector_size(const char *device_path);
void secure_zero(void *ptr, size_t size);
int create_directory(const char *path);
int file_exists(const char *path);
int copy_file(const char *src, const char *dest);
int remove_file(const char *path);
int is_whole_device(const char *device_path);
char *safe_strdup(const char *str);
int get_device_model(const char *device_path, char *model, size_t model_size);
int get_device_serial(const char *device_path, char *serial, size_t serial_size);
int is_device_rotational(const char *device_path);

#endif