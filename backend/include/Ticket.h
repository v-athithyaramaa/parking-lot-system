#pragma once
#include <string>
#include <chrono>

class Ticket
{
private:
    std::string licensePlate;
    int floorNumber;
    int spotNumber;
    double hourlyRate;

    std::chrono::time_point<std::chrono::system_clock> entryTime;

public:
    Ticket(std::string plate, int floor, int spot, double rate);

    int getFloorNumber() const;
    int getSpotNumber() const;
    std::string getLicensePlate() const;

    double calculateFinalFee() const;
};