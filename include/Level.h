#pragma once
#include <vector>
#include <memory>
#include "ParkingSpot.h"

class Level {
private:
    int floorNumber;
    std::vector<ParkingSpot> spots;

public:
    Level(int floor, int numSpots);

    int parkVehicle(std::unique_ptr<Vehicle>& vehicle);

    bool freeSpot(int spotNumber);
    int getAvailableSpots() const;
    int getTotalSpots() const { return static_cast<int>(spots.size()); }
    int getFloorNumber() const { return floorNumber; }
    const std::vector<ParkingSpot>& getSpots() const { return spots; }
};