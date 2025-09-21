# Compiler and flags
CC = gcc
CFLAGS = -Wall -Wextra -std=c99 -D_GNU_SOURCE -Wno-format-truncation -g -O2
LDFLAGS = 
LIBS = -lcrypto  # OpenSSL library

# Directories
SRC_DIR = src
BUILD_DIR = build
BIN_DIR = bin

# Source files (all .c files in src directory)
SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(SRCS:$(SRC_DIR)/%.c=$(BUILD_DIR)/%.o)
TARGET = $(BIN_DIR)/wipe_sure

# Default target - build the executable
all: $(TARGET)

# Create binary executable
$(TARGET): $(OBJS) | $(BIN_DIR)
	$(CC) $(LDFLAGS) -o $@ $^ $(LIBS)
	@echo "✅ Build successful: $(TARGET)"

# Create object files
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) -I$(SRC_DIR) -c -o $@ $<

# Create build and bin directories if they don't exist
$(BUILD_DIR):
	@mkdir -p $(BUILD_DIR)
	@echo "📁 Created build directory"

$(BIN_DIR):
	@mkdir -p $(BIN_DIR)
	@echo "📁 Created bin directory"

# Clean build files
clean:
	@rm -rf $(BUILD_DIR) $(BIN_DIR) wipe_sure libwipesure.a 2>/dev/null || true
	@echo "🧹 Cleaned build files"

# Install system-wide
install: $(TARGET)
	@sudo cp $(TARGET) /usr/local/bin/wipe_sure
	@echo "📦 Installed to /usr/local/bin/wipe_sure"

# Uninstall
uninstall:
	@sudo rm -f /usr/local/bin/wipe_sure 2>/dev/null || true
	@echo "🗑️ Uninstalled from /usr/local/bin/wipe_sure"

# Debug build with extra flags
debug: CFLAGS += -g -DDEBUG
debug: clean
	@echo "🐛 Building debug version..."
	@$(MAKE) all

# Release build with optimizations
release: CFLAGS += -O3 -DNDEBUG
release: clean
	@echo "🚀 Building release version..."
	@$(MAKE) all

# Quick build without creating directories
quick: $(SRCS)
	@echo "⚡ Quick build..."
	@$(CC) $(CFLAGS) -I$(SRC_DIR) $(SRCS) -o wipe_sure $(LIBS)
	@echo "✅ Quick build successful: ./wipe_sure"

# Build static library
lib: libwipesure.a

libwipesure.a: $(OBJS)
	@ar rcs $@ $^
	@echo "📚 Built library: $@"

# Show help
help:
	@echo "Available targets:"
	@echo "  make all       - Build executable (default)"
	@echo "  make clean     - Clean build files"
	@echo "  make install   - Install system-wide"
	@echo "  make uninstall - Uninstall"
	@echo "  make debug     - Build debug version"
	@echo "  make release   - Build release version"
	@echo "  make quick     - Quick build without directories"
	@echo "  make lib       - Build static library"
	@echo "  make help      - Show this help"

.PHONY: all clean install uninstall debug release quick lib help
