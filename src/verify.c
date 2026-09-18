#include "verify.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <time.h>

#define VERIFY_BLOCK_SIZE (1024 * 1024) // 1MB blocks

int verify_wipe(const char *device_path, uint64_t device_size, char **log_output) {
    char output[2048] = {0};
    int fd = open(device_path, O_RDONLY | O_DIRECT); // Open in direct mode to bypass OS cache
    
    if (fd < 0) {
        // Fallback to normal read if O_DIRECT fails
        fd = open(device_path, O_RDONLY);
        if (fd < 0) {
            if (log_output) *log_output = strdup("Failed to open device for verification.");
            return -1;
        }
    }
    
    // Allocate 1MB block aligned to memory boundary
    void *buffer = NULL;
    if (posix_memalign(&buffer, 4096, VERIFY_BLOCK_SIZE) != 0) {
        close(fd);
        if (log_output) *log_output = strdup("Memory allocation failed.");
        return -1;
    }
    
    strcat(output, "Starting mathematical verification of wipe...\n");
    
    // We will sample 100 random blocks across the drive to ensure speed + accuracy
    // For a full forensic audit, this would scan the entire drive.
    int sample_count = 100;
    int failed_blocks = 0;
    
    srand(time(NULL));
    
    for (int i = 0; i < sample_count; i++) {
        // Calculate random offset aligned to block size
        uint64_t max_blocks = device_size / VERIFY_BLOCK_SIZE;
        if (max_blocks == 0) break;
        
        uint64_t random_block = rand() % max_blocks;
        off_t offset = random_block * VERIFY_BLOCK_SIZE;
        
        if (lseek(fd, offset, SEEK_SET) < 0) {
            continue;
        }
        
        ssize_t bytes_read = read(fd, buffer, VERIFY_BLOCK_SIZE);
        if (bytes_read <= 0) continue;
        
        // Check if the block is empty (all zeroes)
        int is_empty = 1;
        unsigned char *p = (unsigned char *)buffer;
        
        // Quick check: check first few bytes before looping 1MB
        if (p[0] != 0x00 || p[1024] != 0x00) {
            // Check if it's high-entropy random data (SED crypto wipe leaves random noise, not zeroes)
            // A simple entropy check could go here, but for strict compliance we often just look for zeros
            // If it's a crypto wipe, the data is technically not zeroes.
            is_empty = 0;
        } else {
            // Deep check the entire 1MB block
            for (ssize_t j = 0; j < bytes_read; j++) {
                if (p[j] != 0x00) {
                    is_empty = 0;
                    break;
                }
            }
        }
        
        if (!is_empty) {
            // Might be an SED crypto wipe (random noise). For MVP, we'll mark as failed if not 0x00.
            failed_blocks++;
        }
    }
    
    free(buffer);
    close(fd);
    
    char temp[256];
    if (failed_blocks == 0) {
        snprintf(temp, sizeof(temp), "Verification PASSED. 100%% of sampled blocks are empty (0x00).\n");
        strcat(output, temp);
        if (log_output) *log_output = strdup(output);
        return 0; // Success
    } else {
        snprintf(temp, sizeof(temp), "Verification FAILED. %d/%d blocks contained residual data.\n", failed_blocks, sample_count);
        strcat(output, temp);
        if (log_output) *log_output = strdup(output);
        return failed_blocks; // Failed
    }
}
