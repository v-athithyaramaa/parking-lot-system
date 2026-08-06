@echo off
setlocal

REM Source file
set SOURCE=%~1

REM Workspace root
set ROOT=%~dp0

REM Build directory
set BUILD=%ROOT%build

if not exist "%BUILD%" mkdir "%BUILD%"

g++ "%SOURCE%" ^
    -std=c++20 ^
    -O2 ^
    -pipe ^
    -Wall ^
    -Wextra ^
    -Wshadow ^
    -o "%BUILD%\app.exe"

if errorlevel 1 (
    echo.
    echo ===============================
    echo Compilation failed.
    echo ===============================
    echo.
    pause
    exit /b
)

echo.
"%BUILD%\app.exe"
echo.