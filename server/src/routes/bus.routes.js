const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all buses
router.get('/buses', async (_, res) => {
  try {
    console.log('Getting all buses');
    const buses = await prisma.bus.findMany({
      orderBy: {
        busNumber: 'asc',
      },
    });
    
    res.json({
      status: 200,
      success: true,
      message: 'Buses retrieved successfully',
      data: buses
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({
      status: 500,
      success: false,
      message: 'Failed to fetch buses',
      error: {
        message: error.message,
        code: 500,
        details: error
      }
    });
  }
});

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

module.exports = router;


module.exports = router;
