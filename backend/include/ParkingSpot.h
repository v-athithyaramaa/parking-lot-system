#pragma once
#include <memory>
#include "Vehicle.h"
#include "VehicleType.h"

class ParkingSpot
{
private:
    int spotNumber;
    VehicleType spotType;

    std::unique_ptr<Vehicle> parkedVehicle;

public:
    ParkingSpot(int number, VehicleType type);

    bool isAvailable() const;

    bool parkVehicle(std::unique_ptr<Vehicle> vehicle);

    std::unique_ptr<Vehicle> removeVehicle();

    int getSpotNumber() const;
    VehicleType getSpotType() const;
};