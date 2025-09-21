#ifndef UTILS_H
#define UTILS_H

#include <stdio.h>
#include <stdint.h>
#include <sys/types.h>

#define LOG_ERROR(fmt, ...) fprintf(stderr, "ERROR: " fmt "\n", ##__VA_ARGS__)
#define LOG_INFO(fmt, ...) fprintf(stdout, "INFO: " fmt "\n", ##__VA_ARGS__)
#define LOG_DEBUG(fmt, ...) fprintf(stdout, "DEBUG: " fmt "\n", ##__VA_ARGS__)

#define SAFE_FREE(ptr) do { if (ptr) { free(ptr); ptr = NULL; } } while (0)

// Function prototypes
int execute_command(const char *cmd, char *output, size_t output_size);
int is_valid_device_path(const char *path);
int get_sysfs_info(const char *device_path, void *info);
int64_t get_current_timestamp();
char* format_timestamp(int64_t timestamp);
int is_whole_device(const char *device_name);
int is_nvme_device(int fd);
int is_usb_device(int fd);
uint64_t get_device_size(const char *device_path);
void secure_zero(void *ptr, size_t size);
int create_directory(const char *path);
int file_exists(const char *path);
int copy_file(const char *src, const char *dest);
int remove_file(const char *path);

#endif