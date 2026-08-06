#pragma once
#include "Vehicle.h"

class Truck : public Vehicle
{
public:
    Truck(string plate) : Vehicle(move(plate), VehicleType::Truck) {}

    double calculateFee() const override
    {
        return 100.0;
    }
};