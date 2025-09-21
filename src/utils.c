#include "utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <linux/fs.h>
#include <sys/stat.h>       // For stat, fstat
#include <time.h>           // For time, localtime, strftime  
#include <ctype.h>          // For isalpha, isdigit
#include <fcntl.h>          // For open, O_RDONLY
#include <sys/sysmacros.h>  // For major, minor

int execute_command(const char *cmd, char *output, size_t output_size) {
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
        char *ptr = output;
        
        while (fgets(ptr, output_size - total_read, fp) != NULL) {
            size_t bytes_read = strlen(ptr);
            total_read += bytes_read;
            ptr += bytes_read;
            
            if (total_read >= output_size - 1) {
                break; // Buffer full
            }
        }
        
        // Ensure null termination
        if (total_read < output_size) {
            output[total_read] = '\0';
        } else {
            output[output_size - 1] = '\0';
        }
    } else {
        // Just execute without capturing output
        char buffer[128];
        while (fgets(buffer, sizeof(buffer), fp) != NULL) {
            // Discard output
        }
    }
    
    return pclose(fp);
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

int get_sysfs_info(const char *device_path, void *info) {
    // This is a placeholder function for sysfs information retrieval
    // You can implement specific sysfs parsing here
    return 0;
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


int is_nvme_device(int fd) {
    char sys_path[512];
    struct stat st;
    
    if (fstat(fd, &st) < 0) {
        return 0;
    }
    
    snprintf(sys_path, sizeof(sys_path), 
             "/sys/dev/block/%d:%d/device/subsystem",
             major(st.st_rdev), minor(st.st_rdev));
    
    char subsystem[64];
    FILE *f = fopen(sys_path, "r");
    if (f) {
        if (fgets(subsystem, sizeof(subsystem), f)) {
            fclose(f);
            return strstr(subsystem, "nvme") != NULL;
        }
        fclose(f);
    }
    
    return 0;
}

int is_usb_device(int fd) {
    char sys_path[512];
    struct stat st;
    
    if (fstat(fd, &st) < 0) {
        return 0;
    }
    
    snprintf(sys_path, sizeof(sys_path), 
             "/sys/dev/block/%d:%d/device/subsystem",
             major(st.st_rdev), minor(st.st_rdev));
    
    char subsystem[64];
    FILE *f = fopen(sys_path, "r");
    if (f) {
        if (fgets(subsystem, sizeof(subsystem), f)) {
            fclose(f);
            return strstr(subsystem, "usb") != NULL;
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
    snprintf(command, sizeof(command), "mkdir -p %s", path);
    return system(command);
}

int file_exists(const char *path) {
    return access(path, F_OK) == 0;
}

int copy_file(const char *src, const char *dest) {
    char command[512];
    snprintf(command, sizeof(command), "cp %s %s", src, dest);
    return system(command);
}

int remove_file(const char *path) {
    return remove(path);
}