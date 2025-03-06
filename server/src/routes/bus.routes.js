const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const busController = require('../controllers/bus.controller');
const {
  createBusValidator,
  updateBusValidator,
  deleteBusValidator,
  getBusByIdValidator,
  getBusesValidator,
} = require('../middleware/validators/bus.validator');

// Get all buses
router.get('/buses', getBusesValidator, busController.getBuses);

// New endpoint to get a bus by its ID
router.get('/buses/:id', getBusByIdValidator, busController.getBusById);

// POST create a new bus
router.post('/buses', createBusValidator, busController.createBus);

// PUT update a bus
router.put('/buses/:id', updateBusValidator, busController.updateBus);

// DELETE a bus
router.delete('/buses/:id', deleteBusValidator, busController.deleteBus);

// Get all routes
router.get('/routes', async (req, res) => {
  try {
    console.log('Getting all routes');
    const routes = await prisma.busRoute.findMany({
      include: {
        bus: true,
        stops: true,
        schedules: true
      },
      orderBy: {
        routeName: 'asc'
      }
    });
    
    res.json({
      status: 200,
      success: true,
      message: 'Routes retrieved successfully',
      data: routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch routes',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// New endpoint to get buses for a specific bus route
router.get('/buses/route/:routeId', async (req, res) => {
  const { routeId } = req.params;
  try {
    console.log(`Getting buses for route ID: ${routeId}`);
    const buses = await prisma.bus.findMany({
      where: {
        routes: {
          some: {
            id: routeId,
          },
        },
      },
      orderBy: {
        busNumber: 'asc',
      },
    });

    res.json({
      status: 200,
      success: true,
      message: `Buses for route ID ${routeId} retrieved successfully`,
      data: buses,
    });
  } catch (error) {
    console.error('Error fetching buses for route:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch buses for the route',
      error: {
        message: error.message,
        code: 500,
        details: error,
      },
    });
  }
});

// New endpoint to get schedules for a specific bus by its ID
router.get('/buses/:busId/schedules', async (req, res) => {
  const { busId } = req.params;
  try {
    console.log(`Getting schedules for bus ID: ${busId}`);
    const schedules = await prisma.busSchedule.findMany({
      where: {
        busId: busId, // Filter schedules by bus ID
      },
      include: {
        route: true, // Include related route information if needed
      },
      orderBy: {
        departureTime: 'asc', // Order by departure time
      },
    });

    if (schedules.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: `No schedules found for bus ID ${busId}`,
      });
    }

    res.json({
      status: 200,
      success: true,
      message: `Schedules for bus ID ${busId} retrieved successfully`,
      data: schedules,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch schedules',
      error: {
        message: error.message,
        code: 500,
        details: error,
      },
    });
  }
});

// New endpoint to get driver information for a specific route
router.get('/routes/:routeId/drivers', async (req, res) => {
  const { routeId } = req.params;
  try {
    console.log(`Getting driver information for route ID: ${routeId}`);
    
    // Fetch the route along with the driver information
    const routeWithDriver = await prisma.busSchedule.findMany({
      where: {
        routeId: routeId,
      },
      include: {
        driver: true, // Assuming there's a relation to the Driver model
      },
    });

    if (!routeWithDriver || routeWithDriver.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: `No drivers found for route ID ${routeId}`,
      });
    }

    res.json({
      status: 200,
      success: true,
      message: `Driver information for route ID ${routeId} retrieved successfully`,
      data: routeWithDriver.map(schedule => ({
        driverId: schedule.driverId,
        driverName: schedule.driver.name, // Assuming the driver's name is stored in the Driver model
        driverContact: schedule.driver.contact, // Assuming there's a contact field
        // Add any other driver fields you want to include
      })),
    });
  } catch (error) {
    console.error('Error fetching driver information:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch driver information',
      error: {
        message: error.message,
        code: 500,
        details: error,
      },
    });
  }
});

// New endpoint to get driver information for a specific schedule
router.get('/schedules/:scheduleId/driver', async (req, res) => {
  const { scheduleId } = req.params;
  try {
    console.log(`Getting driver information for schedule ID: ${scheduleId}`);
    
    // Fetch the schedule along with the driver ID
    const schedule = await prisma.busSchedule.findUnique({
      where: {
        id: scheduleId,
      },
      select: {
        driverId: true, // Only select the driverId
      },
    });

    if (!schedule) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: `No schedule found for ID ${scheduleId}`,
      });
    }

    // Fetch the driver information using the driverId
    const driver = await prisma.driver.findUnique({
      where: {
        id: schedule.driverId,
      },
    });

    if (!driver) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: `No driver found for ID ${schedule.driverId}`,
      });
    }

    res.json({
      status: 200,
      success: true,
      message: `Driver information for schedule ID ${scheduleId} retrieved successfully`,
      data: {
        driverId: driver.id,
        driverName: `${driver.firstName} ${driver.lastName}`, // Combine first and last name
        driverContact: driver.phone, // Assuming there's a phone field
        // Add any other driver fields you want to include
      },
    });
  } catch (error) {
    console.error('Error fetching driver information:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch driver information',
      error: {
        message: error.message,
        code: 500,
        details: error,
      },
    });
  }
});

// New route to get bus stops for a specific route
router.get('/routes/:routeId/stops', async (req, res) => {
  const { routeId } = req.params;

  try {
    const busStops = await prisma.busStop.findMany({
      where: {
        routeId: routeId, // Assuming you have a routeId field in your busStop model
      },
    });

    if (!busStops || busStops.length === 0) {
      return res.status(404).json({ message: 'No bus stops found for this route.' });
    }

    return res.status(200).json({ data: busStops });
  } catch (error) {
    console.error("Error fetching bus stops:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// New endpoint to get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await prisma.busSchedule.findMany({
      include: {
        bus: true, // Include bus details if needed
        driver: true, // Include driver details if needed
      },
    });

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: 'No schedules found.' });
    }

    res.json({
      status: 200,
      success: true,
      message: 'Schedules retrieved successfully',
      data: schedules,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch schedules',
      error: {
        message: error.message,
        code: 500,
        details: error,
      },
    });
  }
});

// New endpoint to get a specific route by ID
router.get('/routes/:id', async (req, res) => {
  const { id } = req.params; // Get the route ID from the request parameters
  try {
    const route = await prisma.busRoute.findUnique({
      where: { id: id }, // Query for the route with the specified ID
      include: {
        // Include any related data if necessary
        bus: true,
        stops: true,
        schedules: true,
      },
    });

    if (!route) {
      return res.status(404).json({ message: 'Route not found.' });
    }

    res.json({
      status: 200,
      success: true,
      message: 'Route retrieved successfully',
      data: route,
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch route',
      error: {
        message: error.message,
        code: 500,
        details: error,
      },
    });
  }
});

// POST create a new driver
router.post('/drivers', busController.createDriver);

// PUT update a driver
router.put('/drivers/:id', busController.updateDriver);

// DELETE a driver
router.delete('/drivers/:id', busController.deleteDriver);

// New endpoint to get all drivers
router.get('/drivers', busController.getDrivers);

// Route Management Endpoints

// Create a new route
router.post('/routes', async (req, res) => {
  try {
    const {
      routeName,
      routeCode,
      startPoint,
      endPoint,
      distance,
      duration,
      direction,
      isActive,
      busId
    } = req.body;

    const route = await prisma.busRoute.create({
      data: {
        routeName,
        routeCode,
        startPoint,
        endPoint,
        distance: parseFloat(distance),
        duration: parseInt(duration),
        direction,
        isActive,
        busId
      },
      include: {
        bus: true,
        stops: true,
        schedules: true
      }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to create route',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Update a route
router.put('/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      routeName,
      routeCode,
      startPoint,
      endPoint,
      distance,
      duration,
      direction,
      isActive,
      busId
    } = req.body;

    const route = await prisma.busRoute.update({
      where: { id },
      data: {
        routeName,
        routeCode,
        startPoint,
        endPoint,
        distance: parseFloat(distance),
        duration: parseInt(duration),
        direction,
        isActive,
        busId
      },
      include: {
        bus: true,
        stops: true,
        schedules: true
      }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Route updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to update route',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Delete a route
router.delete('/routes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First delete all associated stops and schedules
    await prisma.busStop.deleteMany({
      where: { routeId: id }
    });

    await prisma.busSchedule.deleteMany({
      where: { routeId: id }
    });

    // Then delete the route
    await prisma.busRoute.delete({
      where: { id }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Route and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to delete route',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Get all routes with related data
router.get('/routes', async (req, res) => {
  try {
    const routes = await prisma.busRoute.findMany({
      include: {
        bus: true,
        stops: {
          orderBy: {
            sequence: 'asc'
          }
        },
        schedules: {
          include: {
            driver: true
          }
        }
      },
      orderBy: {
        routeName: 'asc'
      }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Routes retrieved successfully',
      data: routes
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch routes',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Schedule Management Endpoints

// Create a new schedule
router.post('/schedules', async (req, res) => {
  try {
    const {
      busId,
      routeId,
      driverId,
      departureTime,
      arrivalTime,
      isRecurring,
      frequency,
      status,
      totalCapacity,
      availableSeats
    } = req.body;

    const schedule = await prisma.busSchedule.create({
      data: {
        busId,
        routeId,
        driverId,
        departureTime,
        arrivalTime,
        isRecurring,
        frequency,
        status,
        totalCapacity: parseInt(totalCapacity),
        availableSeats: parseInt(availableSeats),
        bookedSeats: 0
      },
      include: {
        bus: true,
        route: true,
        driver: true
      }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to create schedule',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Update a schedule
router.put('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      busId,
      routeId,
      driverId,
      departureTime,
      arrivalTime,
      isRecurring,
      frequency,
      status,
      totalCapacity,
      availableSeats
    } = req.body;

    const schedule = await prisma.busSchedule.update({
      where: { id },
      data: {
        busId,
        routeId,
        driverId,
        departureTime,
        arrivalTime,
        isRecurring,
        frequency,
        status,
        totalCapacity: parseInt(totalCapacity),
        availableSeats: parseInt(availableSeats)
      },
      include: {
        bus: true,
        route: true,
        driver: true
      }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to update schedule',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Delete a schedule
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete any associated reminders first
    await prisma.reminder.deleteMany({
      where: { scheduleId: id }
    });

    // Then delete the schedule
    await prisma.busSchedule.delete({
      where: { id }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Schedule and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to delete schedule',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Get all schedules with related data
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await prisma.busSchedule.findMany({
      include: {
        bus: true,
        route: true,
        driver: true
      },
      orderBy: {
        departureTime: 'asc'
      }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Schedules retrieved successfully',
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch schedules',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Get schedules by route
router.get('/routes/:routeId/schedules', async (req, res) => {
  try {
    const { routeId } = req.params;
    const schedules = await prisma.busSchedule.findMany({
      where: {
        routeId
      },
      include: {
        bus: true,
        driver: true
      },
      orderBy: {
        departureTime: 'asc'
      }
    });

    res.json({
      status: 200,
      success: true,
      message: `Schedules for route ${routeId} retrieved successfully`,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching schedules for route:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch schedules for route',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

// Get active schedules for today
router.get('/schedules/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await prisma.busSchedule.findMany({
      where: {
        OR: [
          {
            // One-time schedules for today
            isRecurring: false,
            validFrom: {
              gte: today,
              lt: tomorrow
            }
          },
          {
            // Recurring schedules that are valid today
            isRecurring: true,
            validFrom: {
              lte: today
            },
            OR: [
              {
                validUntil: null
              },
              {
                validUntil: {
                  gte: today
                }
              }
            ]
          }
        ],
        status: {
          in: ['SCHEDULED', 'PENDING', 'DELAYED']
        }
      },
      include: {
        bus: true,
        route: true,
        driver: true
      },
      orderBy: {
        departureTime: 'asc'
      }
    });

    res.json({
      status: 200,
      success: true,
      message: 'Today\'s schedules retrieved successfully',
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching today\'s schedules:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch today\'s schedules',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

module.exports = router;
