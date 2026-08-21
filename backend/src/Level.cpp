#include "Level.h"

Level::Level(int floor, int numSpots) : floorNumber(floor)
{
    spots.reserve(numSpots);

    for (int i = 1; i <= numSpots; i++)
    {
        VehicleType type = VehicleType::Car;
        if (i % 4 == 0)
            type = VehicleType::Truck;
        else if (i % 4 == 1)
            type = VehicleType::Motorcycle;

        spots.emplace_back(i, type);
    }
}

int Level::parkVehicle(std::unique_ptr<Vehicle> &vehicle)
{
    for (auto &spot : spots)
    {
        if (spot.isAvailable() && spot.getSpotType() == vehicle->getType())
        {
            int spotNum = spot.getSpotNumber(); // Remember the spot!
            spot.parkVehicle(std::move(vehicle));
            return spotNum; // Return the spot number instead of 'true'
        }
    }
    return -1;
}

bool Level::restoreVehicleToSpot(std::unique_ptr<Vehicle> &vehicle, int spotNumber)
{
    for (auto &spot : spots)
    {
        if (spot.getSpotNumber() == spotNumber && spot.isAvailable() && spot.getSpotType() == vehicle->getType())
        {
            spot.parkVehicle(std::move(vehicle));
            return true;
        }
    }
    return false;
}

bool Level::freeSpot(int spotNumber)
{
    for (auto &spot : spots)
    {
        if (spot.getSpotNumber() == spotNumber && !spot.isAvailable())
        {
            spot.removeVehicle();
            return true;
        }
    }
    return false;
}

int Level::getAvailableSpots() const
{
    int count = 0;
    for (const auto &spot : spots)
    {
        if (spot.isAvailable())
        {
            count++;
        }
    }
    return count;
}