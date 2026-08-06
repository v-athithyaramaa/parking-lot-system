# ==========================================
# STAGE 1: The Builder Environment
# ==========================================
FROM ubuntu:22.04 AS builder

# Prevent interactive timezone prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install all necessary C++ build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    ninja-build \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /build_env

# Copy your source code and CMake configuration
COPY CMakeLists.txt .
COPY include/ ./include/
COPY src/ ./src/

# Run CMake and Ninja to compile the Linux binary
# FetchContent will download Crow, Asio, and SQLiteCpp automatically
RUN cmake -G Ninja -B build -S . -DCMAKE_BUILD_TYPE=Release
RUN cmake --build build

# ==========================================
# STAGE 2: The Production Runtime Environment
# ==========================================
FROM ubuntu:22.04 AS runtime

# Create a non-root user for production security
RUN useradd -m parkingservice

# Setup application directories
WORKDIR /app
RUN mkdir /app/data && chown parkingservice:parkingservice /app/data

# Copy ONLY the compiled binary from Stage 1. 
# We leave gigabytes of source code and compilers behind!
COPY --from=builder /build_env/build/parking-lot-system /app/parking-lot-system

# Make the binary executable
RUN chmod +x /app/parking-lot-system

# Drop root privileges
USER parkingservice

# Move into the data directory so SQLite creates parking_lot.db here
WORKDIR /app/data

# Expose the Crow REST API port
EXPOSE 8080

# Run the server (referencing the binary in the parent folder)
CMD ["../parking-lot-system"]