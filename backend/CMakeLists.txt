cmake_minimum_required(VERSION 3.14)
project(ParkingLotMicroservice)

# Tells CMake where to look for your .h files
include_directories(include)

include(FetchContent)
# 1. Fetch Asio directly (since it isn't installed locally on Windows)
FetchContent_Declare(
  asio
  GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
  GIT_TAG asio-1-30-2 # Latest stable Asio
)
# Download Asio without trying to compile it (it's a header-only library)
FetchContent_GetProperties(asio)
if(NOT asio_POPULATED)
    FetchContent_Populate(asio)
endif()

# 2. Tell CMake exactly where the newly downloaded Asio headers are
set(ASIO_INCLUDE_DIR "${asio_SOURCE_DIR}/asio/include" CACHE PATH "ASIO headers" FORCE)

# 3. Fetch Crow (v1.2.0)
FetchContent_Declare(
  Crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG v1.2.0
)
set(CROW_BUILD_EXAMPLES OFF CACHE BOOL "Disable Crow examples" FORCE)
set(CROW_BUILD_TESTS OFF CACHE BOOL "Disable Crow tests" FORCE)

FetchContent_MakeAvailable(Crow)

FetchContent_Declare(
  SQLiteCpp
  GIT_REPOSITORY https://github.com/SRombauts/SQLiteCpp.git
  GIT_TAG 3.3.3
)

# 1. Turn off all tests, linters, and examples
set(SQLITECPP_RUN_CPPLINT OFF CACHE BOOL "Disable cpplint" FORCE)
set(SQLITECPP_RUN_CPPCHECK OFF CACHE BOOL "Disable cppcheck" FORCE)
set(SQLITECPP_BUILD_TESTS OFF CACHE BOOL "Disable tests" FORCE)
set(SQLITECPP_BUILD_EXAMPLES OFF CACHE BOOL "Disable examples" FORCE)

# 2. CRITICAL FOR WINDOWS: Force SQLiteCpp to build the raw sqlite3 engine itself
set(SQLITECPP_INTERNAL_SQLITE ON CACHE BOOL "Build internal sqlite3" FORCE)

FetchContent_MakeAvailable(SQLiteCpp)

# 4. Create the executable with ONLY source files
add_executable(parking-lot-system 
    src/main.cpp 
    src/ParkingLot.cpp 
    src/Level.cpp 
    src/ParkingSpot.cpp
    src/Ticket.cpp
    src/Database.cpp
)

# 5. Link the libraries to the executable we just created
target_link_libraries(parking-lot-system PRIVATE Crow::Crow ws2_32 wsock32 SQLiteCpp sqlite3)