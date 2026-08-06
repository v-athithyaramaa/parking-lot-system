#pragma once
#include "Vehicle.h"
using std::move;
using std::string;

class Car : public Vehicle
{
public:
    Car(string plate) : Vehicle(std::move(plate), VehicleType::Car) {}
    double calculateFee() const override
    {
        return 50.0;
    }
};