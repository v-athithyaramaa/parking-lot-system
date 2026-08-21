#include "Database.h"
#include <iostream>

Database::Database() : db("parking_lot.db", SQLite::OPEN_READWRITE | SQLite::OPEN_CREATE)
{
    try
    {
        db.exec("CREATE TABLE IF NOT EXISTS parked_vehicles (plate TEXT PRIMARY KEY, type TEXT, floor INTEGER, spot INTEGER)");
    }
    catch (std::exception &e)
    {
        std::cerr << "SQLite exception during initialization: " << e.what() << std::endl;
    }
}

void Database::saveVehicle(const std::string &plate, const std::string &type, int floor, int spot)
{
    SQLite::Statement query(db, "INSERT INTO parked_vehicles (plate, type, floor, spot) VALUES (?, ?, ?, ?)");
    query.bind(1, plate);
    query.bind(2, type);
    query.bind(3, floor);
    query.bind(4, spot);
    query.exec();
}

void Database::removeVehicle(const std::string &plate)
{
    SQLite::Statement query(db, "DELETE FROM parked_vehicles WHERE plate = ?");
    query.bind(1, plate);
    query.exec();
}

bool Database::getVehicleLocation(const std::string &plate, int &floor, int &spot)
{
    SQLite::Statement query(db, "SELECT floor, spot FROM parked_vehicles WHERE plate = ?");
    query.bind(1, plate);

    if (query.executeStep())
    {
        floor = query.getColumn(0).getInt();
        spot = query.getColumn(1).getInt();
        return true;
    }
    return false;
}

void Database::recoverState()
{
    SQLite::Statement query(db, "SELECT * FROM parked_vehicles");
    std::cout << "--- Recovering Database State ---\n";
    while (query.executeStep())
    {
        std::string plate = query.getColumn(0).getString();
        std::string type = query.getColumn(1).getString();
        int floor = query.getColumn(2).getInt();
        int spot = query.getColumn(3).getInt();
        std::cout << "-> Restoring " << type << " [" << plate << "] to Floor " << floor << " Spot " << spot << "\n";
    }
    std::cout << "---------------------------------\n";
}

std::vector<VehicleRecord> Database::getAllVehicles()
{
    std::vector<VehicleRecord> records;
    SQLite::Statement query(db, "SELECT * FROM parked_vehicles");
    while (query.executeStep())
    {
        VehicleRecord vr;
        vr.plate = query.getColumn(0).getString();
        vr.type = query.getColumn(1).getString();
        vr.floor = query.getColumn(2).getInt();
        vr.spot = query.getColumn(3).getInt();
        records.push_back(vr);
    }
    return records;
}