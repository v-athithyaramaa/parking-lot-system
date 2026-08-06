# 🅿️ Parking Lot Management System

A high-performance, multi-level Parking Lot Management System built with a **C++ Crow REST microservice**, **SQLite persistence**, and a **React + Tailwind CSS** real-time command dashboard.

---

## 🌟 Features

- **Multi-Level Parking (3 Floors, 18 Spots)**:
  - Supports **Cars** 🚗, **Motorcycles** 🏍️, and **Trucks** 🚚 with designated spot dimensions and rates.
  - Automatic floor-to-floor spot allocation and capacity cascading.
- **C++ REST Microservice (Crow C++ Framework)**:
  - Clean REST API (`/park`, `/checkout`, `/availability`).
  - Thread-safe memory allocations using mutex locking.
  - Persistent SQLite storage for state recovery on restart.
  - Full CORS support.
- **Modern Minimalist Command Dashboard (React + Tailwind CSS)**:
  - Real-time backend connectivity heartbeat & status indicator.
  - Interactive multi-level floor map with live occupancy indicators.
  - Park & Checkout forms with instant validation, presets, and loading states.
  - Stacked Toast notification system with 1-click ticket ID copying.
  - Transaction audit trail and capacity utilization graphs.

---

## 🏗️ Architecture

```
parking-lot-system/
├── CMakeLists.txt              # C++ CMake build definition
├── include/                    # C++ Header files
│   ├── Database.h
│   ├── Level.h
│   ├── ParkingLot.h
│   ├── ParkingSpot.h
│   ├── Ticket.h
│   ├── Vehicle.h
│   └── VehicleType.h
├── src/                        # C++ Implementation files
│   ├── Database.cpp
│   ├── Level.cpp
│   ├── ParkingLot.cpp
│   ├── ParkingSpot.cpp
│   └── main.cpp
└── frontend/                   # React + Vite + Tailwind CSS Dashboard
    ├── src/
    │   ├── components/         # Header, ParkCard, CheckoutCard, SpotVisualizer, etc.
    │   ├── services/api.js     # API client
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quick Start

### 1. Build and Run C++ Backend

#### Prerequisites
- C++17 compiler (MSVC / GCC / Clang)
- CMake 3.15+
- Ninja / Make

```powershell
# Configure CMake
cmake -B build -G Ninja

# Compile the microservice
cmake --build build

# Run the server (starts at http://localhost:8080)
.\build\parking-lot-system.exe
```

---

### 2. Run the React Frontend

#### Prerequisites
- Node.js 18+ & npm

```powershell
# Navigate into the frontend folder
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Contract

| Endpoint | Method | Payload / Params | Success Response (200) | Failure Response |
| :--- | :--- | :--- | :--- | :--- |
| `/availability` | `GET` | _None_ | `{"totalLevels": 3, "totalSpots": 18, "levels": [...]}` | `500 Server Error` |
| `/park` | `POST` | `{"plate": "KA-01-AB-1234", "type": "Car"}` | `{"status": "success", "ticketId": "...", "floor": 1, "spot": 2}` | `409 Conflict` (Lot Full) |
| `/checkout` | `POST` | `{"plate": "KA-01-AB-1234"}` | `{"status": "success", "message": "Spot freed successfully"}` | `404 Not Found` |

---

## 📜 License

MIT License.
