#include "ParkingSpot.h"

ParkingSpot::ParkingSpot(int number, VehicleType type)
    : spotNumber(number), spotType(type), parkedVehicle(nullptr) {}

bool ParkingSpot::isAvailable() const
{
    return parkedVehicle == nullptr;
}

bool ParkingSpot::parkVehicle(std::unique_ptr<Vehicle> vehicle)
{
    if (!isAvailable())
    {
        return false;
    }
    if (vehicle->getType() != spotType)
    {
        return false;
    }

    parkedVehicle = std::move(vehicle);
    return true;
}

std::unique_ptr<Vehicle> ParkingSpot::removeVehicle()
{
    return std::move(parkedVehicle);
}

int ParkingSpot::getSpotNumber() const { return spotNumber; }
VehicleType ParkingSpot::getSpotType() const { return spotType; }