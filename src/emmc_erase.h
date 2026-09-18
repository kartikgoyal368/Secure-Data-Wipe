#ifndef EMMC_ERASE_H
#define EMMC_ERASE_H

// Erases an eMMC device using mmc-utils
int emmc_secure_erase(const char *device_path, char **log_output);

#endif // EMMC_ERASE_H
