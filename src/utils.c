#define _GNU_SOURCE
#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/ioctl.h>
#include <linux/fs.h>
#include <sys/sysmacros.h>
#include <time.h>
#include <ctype.h>
#include <fcntl.h>

int execute_command(const char *cmd, char *output, size_t output_size) {
    if (!cmd) return -1;
    
    FILE *fp = popen(cmd, "r");
    if (!fp) {
        return -1;
    }
    
    // Initialize output buffer
    if (output && output_size > 0) {
        output[0] = '\0';
    }
    
    // Read command output
    if (output && output_size > 0) {
        size_t total_read = 0;
        char buffer[256];
        
        while (fgets(buffer, sizeof(buffer), fp) != NULL) {
            size_t len = strlen(buffer);
            if (total_read + len >= output_size) {
                len = output_size - total_read - 1;
            }
            
            if (len > 0) {
                strncat(output, buffer, len);
                total_read += len;
            }
            
            if (total_read >= output_size - 1) {
                break;
            }
        }
        
        // Ensure null termination
        output[output_size - 1] = '\0';
    } else {
        // Just execute without capturing output
        char buffer[128];
        while (fgets(buffer, sizeof(buffer), fp) != NULL) {
            // Discard output
        }
    }
    
    int status = pclose(fp);
    return WEXITSTATUS(status);
}

int is_valid_device_path(const char *path) {
    if (!path || strlen(path) < 5) {
        return 0;
    }
    
    // Check if path starts with /dev/
    if (strncmp(path, "/dev/", 5) != 0) {
        return 0;
    }
    
    // Check if it's a block device
    struct stat st;
    if (stat(path, &st) < 0) {
        return 0;
    }
    
    return S_ISBLK(st.st_mode);
}

int64_t get_current_timestamp() {
    return (int64_t)time(NULL);
}

char* format_timestamp(int64_t timestamp) {
    char *buffer = malloc(64);
    if (!buffer) {
        return NULL;
    }
    
    time_t t = (time_t)timestamp;
    struct tm *tm_info = localtime(&t);
    
    strftime(buffer, 64, "%Y-%m-%dT%H:%M:%S%z", tm_info);
    return buffer;
}

int is_nvme_device(const char *device_path) {
    // Check if device path contains "nvme"
    return (strstr(device_path, "nvme") != NULL);
}

int is_usb_device(const char *device_path) {
    char sys_path[512];
    struct stat st;
    
    if (stat(device_path, &st) < 0) {
        return 0;
    }
    
    // Build sysfs path
    snprintf(sys_path, sizeof(sys_path), 
             "/sys/dev/block/%d:%d/device/subsystem",
             major(st.st_rdev), minor(st.st_rdev));
    
    char subsystem[64] = {0};
    FILE *f = fopen(sys_path, "r");
    if (f) {
        if (fgets(subsystem, sizeof(subsystem), f)) {
            fclose(f);
            return (strstr(subsystem, "usb") != NULL);
        }
        fclose(f);
    }
    
    return 0;
}

uint64_t get_device_size(const char *device_path) {
    int fd = open(device_path, O_RDONLY);
    if (fd < 0) {
        return 0;
    }
    
    uint64_t size = 0;
    if (ioctl(fd, BLKGETSIZE64, &size) < 0) {
        close(fd);
        return 0;
    }
    
    close(fd);
    return size;
}

int get_device_sector_size(const char *device_path) {
    int fd = open(device_path, O_RDONLY);
    if (fd < 0) {
        return 512; // Default sector size
    }
    
    int sector_size = 512;
    if (ioctl(fd, BLKSSZGET, &sector_size) < 0) {
        close(fd);
        return 512; // Default on error
    }
    
    close(fd);
    return sector_size;
}

void secure_zero(void *ptr, size_t size) {
    if (ptr && size > 0) {
        volatile unsigned char *p = ptr;
        while (size--) {
            *p++ = 0;
        }
    }
}

int create_directory(const char *path) {
    char command[512];
    snprintf(command, sizeof(command), "mkdir -p \"%s\"", path);
    return system(command);
}

int file_exists(const char *path) {
    return access(path, F_OK) == 0;
}

int copy_file(const char *src, const char *dest) {
    char command[512];
    snprintf(command, sizeof(command), "cp \"%s\" \"%s\"", src, dest);
    return system(command);
}

int remove_file(const char *path) {
    return remove(path);
}

int is_whole_device(const char *device_path) {
    if (!device_path) return 0;
    
    const char *basename = strrchr(device_path, '/');
    if (!basename) basename = device_path;
    else basename++;
    
    size_t len = strlen(basename);
    if (len == 0) return 0;
    
    // Whole devices: sda, nvme0n1 (don't end with digits)
    // Partitions: sda1, nvme0n1p1 (end with digits)
    return isdigit(basename[len - 1]) ? 0 : 1;
}

char *safe_strdup(const char *str) {
    if (!str) return NULL;
    char *new_str = strdup(str);
    if (!new_str) {
        fprintf(stderr, "Memory allocation failed in safe_strdup\n");
        return NULL;
    }
    return new_str;
}

int get_device_model(const char *device_path, char *model, size_t model_size) {
    char sys_path[512];
    struct stat st;
    
    if (stat(device_path, &st) < 0) {
        return -1;
    }
    
    snprintf(sys_path, sizeof(sys_path), 
             "/sys/dev/block/%d:%d/device/model",
             major(st.st_rdev), minor(st.st_rdev));
    
    FILE *f = fopen(sys_path, "r");
    if (f) {
        if (fgets(model, model_size, f)) {
            // Remove trailing newline
            model[strcspn(model, "\n")] = '\0';
            fclose(f);
            return 0;
        }
        fclose(f);
    }
    
    return -1;
}

int get_device_serial(const char *device_path, char *serial, size_t serial_size) {
    char sys_path[512];
    struct stat st;
    
    if (stat(device_path, &st) < 0) {
        return -1;
    }
    
    snprintf(sys_path, sizeof(sys_path), 
             "/sys/dev/block/%d:%d/device/serial",
             major(st.st_rdev), minor(st.st_rdev));
    
    FILE *f = fopen(sys_path, "r");
    if (f) {
        if (fgets(serial, serial_size, f)) {
            // Remove trailing newline
            serial[strcspn(serial, "\n")] = '\0';
            fclose(f);
            return 0;
        }
        fclose(f);
    }
    
    return -1;
}

int is_device_rotational(const char *device_path) {
    char sys_path[512];
    struct stat st;
    char rotational[2] = {0};
    
    if (stat(device_path, &st) < 0) {
        return -1;
    }
    
    snprintf(sys_path, sizeof(sys_path), 
             "/sys/dev/block/%d:%d/queue/rotational",
             major(st.st_rdev), minor(st.st_rdev));
    
    FILE *f = fopen(sys_path, "r");
    if (f) {
        if (fgets(rotational, sizeof(rotational), f)) {
            fclose(f);
            return atoi(rotational);
        }
        fclose(f);
    }
    
    return -1;
}