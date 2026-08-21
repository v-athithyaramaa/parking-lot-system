#pragma once
#include <vector>
#include "Level.h"
#include <mutex>
#include "Ticket.h"
#include "Database.h"

class ParkingLot
{
private:
    std::vector<Level> levels;
    mutable std::mutex lotMutex;
    ParkingLot();
    Database db;

public:
    // Meyers Singleton Instance Accessor
    static ParkingLot &getInstance();

    ParkingLot(const ParkingLot &) = delete;
    ParkingLot &operator=(const ParkingLot &) = delete;

    void addLevel(int numSpots);
    void restoreStateFromDB();
    std::unique_ptr<Ticket> parkVehicle(std::unique_ptr<Vehicle> &vehicle);
    bool freeSpot(int floorNumber, int spotNumber);
    void displayAvailability() const;
    bool checkoutVehicle(const std::string& plate);

    int getLevelsCount() const;
    int getTotalSpots() const;
    int getTotalAvailableSpots() const;
    const std::vector<Level>& getLevels() const;
};