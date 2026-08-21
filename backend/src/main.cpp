#include "crow.h"
#include <memory>
#include <iostream>
#include "ParkingLot.h"
#include "Car.h"
#include "Motorcycle.h"
#include "Truck.h"
#include "Ticket.h"

// Helper to attach CORS headers to all HTTP responses
inline crow::response add_cors_headers(crow::response res)
{
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    return res;
}

int main()
{
    try
    {
        // Initialize application
        crow::SimpleApp app;

        // Catch-all route to handle preflight OPTIONS requests across all paths
        CROW_CATCHALL_ROUTE(app)
        ([](crow::response &res)
         {
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
            res.code = 200;
            res.end(); });

        // Initialize our Singleton Engine with 3 Levels (6 spots per level)
        ParkingLot &lot = ParkingLot::getInstance();
        lot.addLevel(6); // Floor 1
        lot.addLevel(6); // Floor 2
        lot.addLevel(6); // Floor 3

        // GET /availability
        CROW_ROUTE(app, "/availability")
        ([&lot]()
         {
            crow::json::wvalue response;
            response["status"] = "success";
            response["message"] = "Parking lot is operational.";
            response["totalLevels"] = lot.getLevelsCount();
            response["totalSpots"] = lot.getTotalSpots();
            response["availableSpots"] = lot.getTotalAvailableSpots();

            std::vector<crow::json::wvalue> levels_json;
            for (const auto &level : lot.getLevels())
            {
                crow::json::wvalue lvl_json;
                lvl_json["floor"] = level.getFloorNumber();
                lvl_json["totalSpots"] = level.getTotalSpots();
                lvl_json["availableSpots"] = level.getAvailableSpots();

                std::vector<crow::json::wvalue> spots_json;
                for (const auto &spot : level.getSpots())
                {
                    crow::json::wvalue sp_json;
                    sp_json["spot"] = spot.getSpotNumber();
                    sp_json["isAvailable"] = spot.isAvailable();
                    std::string typeStr = "Car";
                    if (spot.getSpotType() == VehicleType::Motorcycle) typeStr = "Motorcycle";
                    else if (spot.getSpotType() == VehicleType::Truck) typeStr = "Truck";
                    sp_json["type"] = typeStr;
                    spots_json.push_back(std::move(sp_json));
                }
                lvl_json["spots"] = std::move(spots_json);
                levels_json.push_back(std::move(lvl_json));
            }
            response["levels"] = std::move(levels_json);

            return add_cors_headers(crow::response(200, response)); });

        // POST /park
        CROW_ROUTE(app, "/park").methods(crow::HTTPMethod::Post)([&lot](const crow::request &req)
                                                                 {
            auto body = crow::json::load(req.body);

            if (!body || !body.has("plate")) {
                crow::json::wvalue err_res;
                err_res["status"] = "failed";
                err_res["message"] = "Invalid JSON. Required: plate";
                return add_cors_headers(crow::response(400, err_res));
            }

            std::string plate = std::string(body["plate"].s());
            std::string type = "Car";
            if (body.has("type")) {
                type = std::string(body["type"].s());
            }

            std::unique_ptr<Vehicle> vehicle;
            if (type == "Car" || type == "car") {
                vehicle = std::make_unique<Car>(plate);
            } else if (type == "Motorcycle" || type == "motorcycle" || type == "Bike" || type == "bike") {
                vehicle = std::make_unique<Motorcycle>(plate);
            } else if (type == "Truck" || type == "truck") {
                vehicle = std::make_unique<Truck>(plate);
            } else {
                crow::json::wvalue err_res;
                err_res["status"] = "failed";
                err_res["message"] = "Unsupported vehicle type. Allowed: Car, Motorcycle, Truck";
                return add_cors_headers(crow::response(400, err_res));
            }

            std::unique_ptr<Ticket> ticket;
            try {
                ticket = lot.parkVehicle(vehicle);
            } catch (const std::invalid_argument& e) {
                crow::json::wvalue err_res;
                err_res["status"] = "failed";
                err_res["message"] = e.what();
                return add_cors_headers(crow::response(400, err_res));
            }

            if (ticket) {
                crow::json::wvalue success_res;
                success_res["status"] = "success";
                std::string ticketId = "TKT-F" + std::to_string(ticket->getFloorNumber()) + "-S" + std::to_string(ticket->getSpotNumber()) + "-" + plate;
                success_res["ticketId"] = ticketId;
                success_res["plate"] = ticket->getLicensePlate();
                success_res["floor"] = ticket->getFloorNumber();
                success_res["spot"] = ticket->getSpotNumber();
                return add_cors_headers(crow::response(200, success_res));
            } else {
                crow::json::wvalue fail_res;
                fail_res["status"] = "failed";
                fail_res["message"] = "Parking lot is full";
                return add_cors_headers(crow::response(409, fail_res));
            } });

        // 3. POST /checkout
        CROW_ROUTE(app, "/checkout").methods(crow::HTTPMethod::Post)([&lot](const crow::request &req)
                                                                     {
            auto body = crow::json::load(req.body);

            if (!body || !body.has("plate")) {
                crow::json::wvalue err_res;
                err_res["status"] = "failed";
                err_res["message"] = "Invalid JSON. Required: plate";
                return add_cors_headers(crow::response(400, err_res));
            }

            std::string plate = body["plate"].s();

            if (lot.checkoutVehicle(plate)) {
                crow::json::wvalue res;
                res["status"] = "success";
                res["message"] = "Spot freed successfully";
                return add_cors_headers(crow::response(200, res));
            } else {
                crow::json::wvalue res;
                res["status"] = "failed";
                res["message"] = "Checkout failed. Plate not found.";
                return add_cors_headers(crow::response(404, res));
            } });

        // Start the server on port 8080 with multiple threads
        std::cout << "[INFO] Parking Lot Server listening on port 8080...\n";
        app.port(8080).multithreaded().run();
    }
    catch (const std::exception &e)
    {
        // THIS WILL CATCH AND PRINT THE SILENT CRASH
        std::cerr << "\n[CRITICAL ERROR]: " << e.what() << "\n\n";
    }
    catch (...)
    {
        std::cerr << "\n[CRITICAL ERROR]: Unknown exception occurred!\n\n";
    }

    return 0;
}