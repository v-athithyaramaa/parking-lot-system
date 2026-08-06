cmake_minimum_required(VERSION 3.14)
project(ParkingLotMicroservice)

# Enable C++17 Standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)

# 1. Fetch Asio directly
FetchContent_Declare(
  asio
  GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
  GIT_TAG asio-1-30-2
)
FetchContent_GetProperties(asio)
if(NOT asio_POPULATED)
    FetchContent_Populate(asio)
endif()

set(ASIO_INCLUDE_DIR "${asio_SOURCE_DIR}/asio/include" CACHE PATH "ASIO headers" FORCE)

# 2. Fetch Crow (v1.2.0)
FetchContent_Declare(
  Crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG v1.2.0
)
set(CROW_BUILD_EXAMPLES OFF CACHE BOOL "Disable Crow examples" FORCE)
set(CROW_BUILD_TESTS OFF CACHE BOOL "Disable Crow tests" FORCE)

FetchContent_MakeAvailable(Crow)

# 3. Fetch SQLiteCpp
FetchContent_Declare(
  SQLiteCpp
  GIT_REPOSITORY https://github.com/SRombauts/SQLiteCpp.git
  GIT_TAG 3.3.3
)
set(SQLITECPP_RUN_CPPLINT OFF CACHE BOOL "Disable cpplint" FORCE)
set(SQLITECPP_RUN_CPPCHECK OFF CACHE BOOL "Disable cppcheck" FORCE)
set(SQLITECPP_BUILD_TESTS OFF CACHE BOOL "Disable tests" FORCE)
set(SQLITECPP_BUILD_EXAMPLES OFF CACHE BOOL "Disable examples" FORCE)
set(SQLITECPP_INTERNAL_SQLITE ON CACHE BOOL "Build internal sqlite3" FORCE)

FetchContent_MakeAvailable(SQLiteCpp)

# 4. Create the executable with source files
add_executable(parking-lot-system 
    src/main.cpp 
    src/ParkingLot.cpp 
    src/Level.cpp 
    src/ParkingSpot.cpp 
    src/Ticket.cpp 
    src/Database.cpp
)

# 5. Include headers directory
target_include_directories(parking-lot-system PRIVATE include)

# 6. Link libraries cross-platform (Windows & Linux/Docker)
target_link_libraries(parking-lot-system PRIVATE Crow::Crow SQLiteCpp sqlite3)

if(WIN32)
    # Windows-specific Winsock networking libraries
    target_link_libraries(parking-lot-system PRIVATE ws2_32 wsock32)
else()
    # Linux / POSIX threading
    target_link_libraries(parking-lot-system PRIVATE pthread)
endif()