#include <iostream>
#include "ParkingLot.h"
ParkingLot::ParkingLot()
{
    db.recoverState();
}

ParkingLot &ParkingLot::getInstance()
{
    static ParkingLot instance;
    return instance;
}

void ParkingLot::addLevel(int numSpots)
{
    std::lock_guard<std::mutex> lock(lotMutex);
    levels.emplace_back(levels.size() + 1, numSpots);
}

bool ParkingLot::checkoutVehicle(const std::string &plate)
{
    int floorNumber;
    int spotNumber;

    if (db.getVehicleLocation(plate, floorNumber, spotNumber))
    {

        if (this->freeSpot(floorNumber, spotNumber))
        {

            db.removeVehicle(plate);
            return true;
        }
    }

    return false;
}

std::unique_ptr<Ticket> ParkingLot::parkVehicle(std::unique_ptr<Vehicle> &vehicle)
{
    std::lock_guard<std::mutex> lock(lotMutex);

    double rate = vehicle->calculateFee();
    std::string plate = vehicle->getLicensePlate();

    // Check if vehicle is already parked to prevent duplicates
    int dummyFloor = 0, dummySpot = 0;
    if (db.getVehicleLocation(plate, dummyFloor, dummySpot))
    {
        throw std::invalid_argument("Vehicle with this license plate is already parked.");
    }

    std::string typeString = "Unknown";
    if (vehicle->getType() == VehicleType::Car)
    {
        typeString = "Car";
    }
    else if (vehicle->getType() == VehicleType::Motorcycle)
    {
        typeString = "Motorcycle";
    }
    else if (vehicle->getType() == VehicleType::Truck)
    {
        typeString = "Truck";
    }

    int currentFloor = 1;
    for (auto &level : levels)
    {
        int spotNum = level.parkVehicle(vehicle);
        if (spotNum != -1)
        {
            db.saveVehicle(plate, typeString, currentFloor, spotNum);
            return std::make_unique<Ticket>(plate, currentFloor, spotNum, rate);
        }
        currentFloor++;
    }
    return nullptr; // Lot is full
}

bool ParkingLot::freeSpot(int floorNumber, int spotNumber)
{
    std::lock_guard<std::mutex> lock(lotMutex);
    if (floorNumber > 0 && floorNumber <= levels.size())
    {
        bool success = levels[floorNumber - 1].freeSpot(spotNumber);
        return success;
    }
    return false;
}

void ParkingLot::displayAvailability() const
{
    std::lock_guard<std::mutex> lock(lotMutex);
    std::cout << "--- Parking Lot Availability ---\n";
    int currentFloor = 1;
    for (const auto &level : levels)
    {
        std::cout << "Floor " << currentFloor << ": "
                  << level.getAvailableSpots() << " spots available.\n";
        currentFloor++;
    }
    std::cout << "--------------------------------\n";
}

int ParkingLot::getLevelsCount() const
{
    std::lock_guard<std::mutex> lock(lotMutex);
    return static_cast<int>(levels.size());
}

int ParkingLot::getTotalSpots() const
{
    std::lock_guard<std::mutex> lock(lotMutex);
    int total = 0;
    for (const auto &lvl : levels)
    {
        total += lvl.getTotalSpots();
    }
    return total;
}

int ParkingLot::getTotalAvailableSpots() const
{
    std::lock_guard<std::mutex> lock(lotMutex);
    int avail = 0;
    for (const auto &lvl : levels)
    {
        avail += lvl.getAvailableSpots();
    }
    return avail;
}

const std::vector<Level> &ParkingLot::getLevels() const
{
    return levels;
}