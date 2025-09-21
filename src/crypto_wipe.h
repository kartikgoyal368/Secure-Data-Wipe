#ifndef CRYPTO_WIPE_H
#define CRYPTO_WIPE_H

#include <stdint.h>

int crypto_wipe_device(const char *device_path, char **log_output);

#endif