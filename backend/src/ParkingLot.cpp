#include <iostream>
#include "Parkinglot.h"
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

    // Grab ALL data BEFORE moving the vehicle
    double rate = vehicle->calculateFee();
    std::string plate = vehicle->getLicensePlate();

    // --- THE FIX: Convert the Enum to a String ---
    std::string typeString = "Unknown";
    // NOTE: If your enum uses lowercase (like VehicleType::Car or just CAR),
    // change the VehicleType::CAR below to match your exact enum definition in Vehicle.h!
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
            // Pass typeString instead of type
            db.saveVehicle(plate, typeString, currentFloor, spotNum);

            // Success! Generate the ticket on the Heap and return it to the driver
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
        // Actually free the spot in memory
        bool success = levels[floorNumber - 1].freeSpot(spotNumber);

        // If successfully freed, remove from database
        // Note: For a true production app, we'd need the plate number here to delete it,
        // but this will require querying the Level to see which car was just removed.
        // For now, this is structurally where it belongs!
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

const std::vector<Level>& ParkingLot::getLevels() const
{
    return levels;
}