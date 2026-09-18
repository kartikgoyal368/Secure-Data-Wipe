#ifndef VERIFY_H
#define VERIFY_H

#include <stdint.h>

// Verifies that a device is completely wiped (contains only zeroes or random noise)
// Returns 0 if verified, -1 on error, >0 if data was found (failed verification)
int verify_wipe(const char *device_path, uint64_t device_size, char **log_output);

#endif // VERIFY_H
