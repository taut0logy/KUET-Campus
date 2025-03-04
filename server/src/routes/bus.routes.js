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

module.exports = router;
