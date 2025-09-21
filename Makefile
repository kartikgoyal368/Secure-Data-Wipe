CC=gcc
CFLAGS=-Wall -Wextra -std=c99 -D_GNU_SOURCE -Wno-format-truncation -g -O2
LDFLAGS=-ljson-c -lm -lcrypto -lssl
TARGET=libwipesure.a
TEST_TARGET=wipesure_test

SRC_DIR=src
TEST_DIR=tests
BUILD_DIR=build

SOURCES=$(wildcard $(SRC_DIR)/*.c)
OBJECTS=$(SOURCES:$(SRC_DIR)/%.c=$(BUILD_DIR)/%.o)
TEST_SOURCES=$(wildcard $(TEST_DIR)/*.c)

.PHONY: all clean test install

all: $(BUILD_DIR) $(TARGET)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(TARGET): $(OBJECTS)
	ar rcs $@ $(OBJECTS)

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c
	$(CC) $(CFLAGS) -c $< -o $@

test: $(TARGET)
	$(CC) $(CFLAGS) $(TEST_SOURCES) -L. -lwipesure -o $(TEST_TARGET) $(LDFLAGS)
	sudo ./$(TEST_TARGET)

clean:
	rm -rf $(BUILD_DIR) $(TARGET) $(TEST_TARGET)

install: $(TARGET)
	sudo cp $(TARGET) /usr/local/lib/
	sudo cp $(SRC_DIR)/*.h /usr/local/include/

.PHONY: all clean test install