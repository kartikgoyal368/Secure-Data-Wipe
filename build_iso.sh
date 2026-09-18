#!/bin/bash
# WipeSure Universal ISO Builder (Enterprise Edition)
# Generates a bootable Linux ISO compatible with Dell, HP, ASUS, Acer, and Lenovo.
# Uses Debian Live-Build with non-free firmware for universal driver support.

set -e

echo "=== WipeSure Universal ISO Builder ==="
echo "1. Installing universal build dependencies..."
sudo apt-get update
sudo apt-get install -y live-build live-boot syslinux grub-efi-amd64-bin squashfs-tools build-essential libssl-dev

WORK_DIR="/tmp/wipesure_universal_iso"
echo "2. Cleaning previous builds..."
sudo rm -rf $WORK_DIR
mkdir -p $WORK_DIR
cd $WORK_DIR

echo "3. Configuring Debian Live Build (Universal Hardware Mode)..."
# Configure live-build for amd64 architecture, standard desktop, non-free firmware
lb config \
    --architecture amd64 \
    --linux-packages "linux-image linux-headers" \
    --archive-areas "main contrib non-free non-free-firmware" \
    --apt-indices false \
    --apt-recommends false \
    --bootappend-live "boot=live components quiet splash nomodeset" \
    --iso-volume "WIPESURE_PRO" \
    --iso-application "WipeSure Data Erasure System" \
    --binary-images iso-hybrid

echo "4. Injecting Proprietary Drivers (linux-firmware)..."
mkdir -p config/package-lists
cat << 'EOF' > config/package-lists/hardware.list.chroot
# Core utilities
hdparm
nvme-cli
util-linux
mmc-utils
mdadm
smartmontools

# Proprietary Drivers for universal compatibility
firmware-linux
firmware-linux-nonfree
firmware-iwlwifi
firmware-realtek
firmware-misc-nonfree
xserver-xorg-video-all

# GUI dependencies
xinit
fluxbox
x11-xserver-utils
libwebkit2gtk-4.0-37
EOF

echo "5. Injecting WipeSure C Engine & Tauri GUI..."
mkdir -p config/includes.chroot/usr/local/bin
mkdir -p config/includes.chroot/opt/wipesure

# Compile the C engine for AMD64 Architecture
echo "Compiling WipeSure C Engine inside Linux environment..."
cd /workspace
make clean
make
cd $WORK_DIR

cp /workspace/bin/wipe_sure config/includes.chroot/usr/local/bin/
chmod +x config/includes.chroot/usr/local/bin/wipe_sure

# Copy Tauri App (Simulated path)
# cp -r /workspace/wipesure-gui/src-tauri/target/release/wipesure-gui config/includes.chroot/opt/wipesure/

echo "6. Configuring Kiosk Mode (Auto-start UI on boot)..."
mkdir -p config/includes.chroot/etc/X11/xinit
cat << 'EOF' > config/includes.chroot/etc/X11/xinit/xinitrc
#!/bin/sh
xset s off
xset s noblank
xset -dpms
# Launch WipeSure GUI in full screen Kiosk Mode
# /opt/wipesure/wipesure-gui &
exec fluxbox
EOF
chmod +x config/includes.chroot/etc/X11/xinit/xinitrc

# Auto login as root and start X11
mkdir -p config/includes.chroot/etc/systemd/system/getty@tty1.service.d
cat << 'EOF' > config/includes.chroot/etc/systemd/system/getty@tty1.service.d/override.conf
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin root --noclear %I $TERM
EOF

mkdir -p config/includes.chroot/root
cat << 'EOF' > config/includes.chroot/root/.bash_profile
if [ -z "$DISPLAY" ] && [ $(tty) = /dev/tty1 ]; then
    startx
fi
EOF

echo "7. Building the Universal ISO (This will take 15-30 minutes to download drivers)..."
sudo lb build

echo "8. Extracting final ISO..."
if [ -f live-image-amd64.hybrid.iso ]; then
    mv live-image-amd64.hybrid.iso /workspace/WipeSure-Universal-Boot.iso
    echo "✅ SUCCESS! Universal ISO generated at /workspace/WipeSure-Universal-Boot.iso"
    echo "Size: $(du -h /workspace/WipeSure-Universal-Boot.iso | cut -f1)"
else
    echo "❌ Build failed. Check live-build logs."
fi
