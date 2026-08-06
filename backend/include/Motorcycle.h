#pragma once
#include "Vehicle.h"

class Motorcycle : public Vehicle
{
public:
    Motorcycle(string plate) : Vehicle(move(plate), VehicleType::Motorcycle) {}

    double calculateFee() const override
    {
        return 20.0;
    }
};