#pragma once
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>

class Database
{
private:
    SQLite::Database db;

public:
    Database();

    void saveVehicle(const std::string &plate, const std::string &type, int floor, int spot);
    void removeVehicle(const std::string &plate);
    void recoverState();
    bool getVehicleLocation(const std::string &plate, int &floorNumber, int &spotNumber);
};