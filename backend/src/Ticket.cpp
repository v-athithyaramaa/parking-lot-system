#include "../include/Ticket.h"

Ticket::Ticket(std::string plate, int floor, int spot, double rate)
    : licensePlate(std::move(plate)), floorNumber(floor), spotNumber(spot), hourlyRate(rate)
{
    entryTime = std::chrono::system_clock::now();
}

int Ticket::getFloorNumber() const { return floorNumber; }
int Ticket::getSpotNumber() const { return spotNumber; }
std::string Ticket::getLicensePlate() const { return licensePlate; }

double Ticket::calculateFinalFee() const
{
    auto exitTime = std::chrono::system_clock::now();

    auto duration = std::chrono::duration_cast<std::chrono::seconds>(exitTime - entryTime);

    double simulatedHours = duration.count();

    if (simulatedHours < 1.0)
    {
        simulatedHours = 1.0;
    }

    return simulatedHours * hourlyRate;
}