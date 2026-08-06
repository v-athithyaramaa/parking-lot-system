#pragma once
#include <string>
#include "VehicleType.h"

// using std::cout;
using std::string;

class Vehicle
{
protected:
    string licensePlate;
    VehicleType type;

public:
    Vehicle(string plate, VehicleType vType) : licensePlate(std::move(plate)), type(vType) {}
    virtual ~Vehicle() = default;

    string getLicensePlate() const
    {
        return licensePlate;
    }

    VehicleType getType() const
    {
        return type;
    }

    virtual double calculateFee() const = 0;
};