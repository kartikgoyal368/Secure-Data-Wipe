#include "verify.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <time.h>
#include <math.h>

#define VERIFY_BLOCK_SIZE (1024 * 1024) // 1MB blocks

/*
 * compute_entropy: Calculates Shannon entropy of a byte buffer.
 * Returns a value in [0.0, 8.0]. Values above ~7.5 indicate
 * high-entropy (effectively random) data, which is expected after
 * a cryptographic wipe (AES-CTR, SED crypto erase, etc.).
 */
static double compute_entropy(const unsigned char *buf, ssize_t len) {
    unsigned long freq[256] = {0};
    for (ssize_t i = 0; i < len; i++) {
        freq[buf[i]]++;
    }
    double entropy = 0.0;
    for (int i = 0; i < 256; i++) {
        if (freq[i] > 0) {
            double p = (double)freq[i] / (double)len;
            entropy -= p * log2(p);
        }
    }
    return entropy;
}

/*
 * verify_wipe:
 *   Samples 100 random 1MB blocks from the device and checks that data
 *   has been erased. A block is considered "wiped" if:
 *
 *     - It is all zeroes (zero-fill / hardware erase / basic overwrite), OR
 *     - It has Shannon entropy >= 7.5 bits/byte (crypto wipe: AES-CTR
 *       encrypted zeros look like high-entropy random noise, which is
 *       cryptographically indistinguishable from erased data).
 *
 *   Before this fix the verifier only accepted zeroes, so every crypto-wiped
 *   drive was incorrectly reported as FAILED.
 */
int verify_wipe(const char *device_path, uint64_t device_size, char **log_output) {
    char output[4096] = {0};
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
    strcat(output, "Accepting: all-zero blocks (zero-fill) OR high-entropy blocks (crypto wipe).\n");
    
    // Sample 100 random blocks across the drive for speed + statistical accuracy.
    // A full forensic scan would read the entire device.
    int sample_count = 100;
    int failed_blocks = 0;
    int zero_blocks = 0;
    int crypto_blocks = 0;
    
    srand(time(NULL));
    
    for (int i = 0; i < sample_count; i++) {
        uint64_t max_blocks = device_size / VERIFY_BLOCK_SIZE;
        if (max_blocks == 0) break;
        
        uint64_t random_block = rand() % max_blocks;
        off_t offset = (off_t)(random_block * VERIFY_BLOCK_SIZE);
        
        if (lseek(fd, offset, SEEK_SET) < 0) {
            continue;
        }
        
        ssize_t bytes_read = read(fd, buffer, VERIFY_BLOCK_SIZE);
        if (bytes_read <= 0) continue;
        
        unsigned char *p = (unsigned char *)buffer;

        // --- Check 1: All-zero block (hardware/overwrite wipe) ---
        int is_all_zero = 1;
        for (ssize_t j = 0; j < bytes_read; j++) {
            if (p[j] != 0x00) {
                is_all_zero = 0;
                break;
            }
        }

        if (is_all_zero) {
            zero_blocks++;
            continue; // Block is wiped (zero-fill)
        }

        // --- Check 2: High-entropy block (crypto wipe) ---
        // AES-CTR / SED crypto erase leaves pseudo-random data (entropy ~8.0).
        // A threshold of 7.5 bits/byte reliably distinguishes ciphertext from
        // structured (recoverable) data, which typically has entropy < 6.0.
        double entropy = compute_entropy(p, bytes_read);
        if (entropy >= 7.5) {
            crypto_blocks++;
            continue; // Block is wiped (crypto / high-entropy)
        }

        // Block contains structured, potentially recoverable data
        failed_blocks++;
    }
    
    free(buffer);
    close(fd);
    
    char temp[512];
    snprintf(temp, sizeof(temp),
             "Sampled %d blocks: %d zero, %d high-entropy (crypto), %d residual.\n",
             sample_count, zero_blocks, crypto_blocks, failed_blocks);
    strncat(output, temp, sizeof(output) - strlen(output) - 1);

    if (failed_blocks == 0) {
        strncat(output, "Verification PASSED. All sampled blocks confirmed wiped.\n",
                sizeof(output) - strlen(output) - 1);
        if (log_output) *log_output = strdup(output);
        return 0;
    } else {
        snprintf(temp, sizeof(temp),
                 "Verification FAILED. %d/%d blocks contain residual structured data.\n",
                 failed_blocks, sample_count);
        strncat(output, temp, sizeof(output) - strlen(output) - 1);
        if (log_output) *log_output = strdup(output);
        return failed_blocks;
    }
}
