const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger.util');
const { sendSuccess, sendError } = require('../utils/response.util');
const { findFaqAnswer } = require('../utils/kuet-faqs.util');
require('dotenv').config();

const prisma = new PrismaClient();

// Initialize Gemini AI safely
let GoogleGenerativeAI;
let genAI = null;

try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;

  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized successfully');
  } else {
    console.warn('⚠️ GEMINI_API_KEY is missing! AI features will be limited.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
}

/**
 * Process queries from cafe managers and provide insights or navigation assistance
 */
exports.processCafeManagerQuery = async (req, res) => {
  try {
    console.log('📝 Received request to AI assistant');
    const { message, history } = req.body;

    if (!message) {
      return sendError(res, 'Message is required', 400);
    }

    console.log('📝 Processing message:', message);

    // Simple navigation logic (works without Gemini)
    const destination = getSimpleNavigationDestination(message);
    if (destination) {
      console.log('🧭 Navigation destination found:', destination.path);
      return sendSuccess(res, {
        response: `I'll take you to ${destination.name}`,
        action: 'navigate',
        destination: destination.path
      });
    }

    // Try to use specialized functions first
    let response = await safelyRunFunction(() =>
      handleWithSpecializedFunctions(message.toLowerCase())
    );

    // If no specialized function handled it and Gemini is available, use it
    if (!response && genAI) {
      response = await safelyRunFunction(() =>
        askGemini(message, history)
      );
    }

    // Default fallback response if nothing else worked
    if (!response) {
      response = "I understand you're asking about something, but I'm currently limited in my capabilities. Try asking about orders, sales, or navigation.";
    }

    return sendSuccess(res, { response });
  } catch (error) {
    console.error('❌ Error in AI assistant:', error);
    return sendError(res, 'Failed to process your request', 500);
  }
};

// Safely run async functions with error handling
async function safelyRunFunction(fn) {
  try {
    return await fn();
  } catch (error) {
    console.error('Function error:', error);
    return null;
  }
}

// Simple navigation without AI
/**
 * Update the function to handle navigation for all parts of the application
 */
// Update the getSimpleNavigationDestination function to include all application routes
function getSimpleNavigationDestination(message) {
  if (!message) return null;

  const msg = message.toLowerCase();

  // Academic-related pages
  if ((msg.includes('class') || msg.includes('academic') || msg.includes('lecture')) && 
      (msg.includes('schedule') || msg.includes('routine') || msg.includes('timetable'))) {
    return { name: 'Academic Schedule', path: '/schedules' };
  }
  
  if (msg.includes('routine') || msg.includes('academic schedule') || msg.includes('class schedule')) {
    return { name: 'Academic Schedule', path: '/schedules/routine' };
  }

  if (msg.includes('assignment') || msg.includes('homework') || msg.includes('coursework')) {
    return { name: 'Assignments', path: '/schedules/assignments' };
  }
  
  // Transportation
  if (msg.includes('bus') || msg.includes('shuttle') || 
      (msg.includes('transport') && msg.includes('schedule'))) {
    return { name: 'Bus Schedule', path: '/bus' };
  }
  


  // Campus events
  if ((msg.includes('event') || msg.includes('happening') || msg.includes('activity')) && 
      !msg.includes('club')) {
    return { name: 'Campus Events', path: '/clubs-and-events' };
  }
  
  // Campus clubs
  if (msg.includes('club') || msg.includes('society') || msg.includes('organization')) {
    return { name: 'Campus Clubs', path: '/clubs-and-events' };
  }

  // User cafe dashboard - Must come BEFORE the general cafeteria check
  if ((msg.includes('user') || msg.includes('my')) && 
      (msg.includes('cafe') || msg.includes('cafeteria')) && 
      msg.includes('dashboard')) {
    return { name: 'User Cafe Dashboard', path: '/cafe-user-dashboard' };
  }
  
  // General pages
  if (msg.includes('home') || msg.includes('main')) {
    return { name: 'Home Page', path: '/dashboard' };
  }


  // Cart and order related pages
  if ((msg.includes('cart') || msg.includes('basket') || msg.includes('shopping')) &&
    !msg.includes('history')) {
    return { name: 'Shopping Cart', path: '/cart' };
  }

  

  if ((msg.includes('order') || msg.includes('delivery')) &&
    !msg.includes('history') && !msg.includes('manage')) {
    return { name: 'Preorders', path: '/preorder' };
  }

  // Cafeteria related pages
  if (msg.includes('cafe') || msg.includes('cafeteria') || msg.includes('canteen')) {
    return { name: 'Cafeteria', path: '/cafeteria' };
  }

  if (msg.includes('menu') || msg.includes('food items') || msg.includes('dishes')) {
    return { name: 'Menu', path: '/cafeteria/menu' };
  }

  // Admin-specific pages
  if (msg.includes('dashboard') || msg.includes('analytics')) {
    return { name: 'Dashboard', path: '/cafe-dashboard' };
  }

  if ((msg.includes('meal') || msg.includes('food')) && msg.includes('manage')) {
    return { name: 'Meal Management', path: '/cafe-meal-control' };
  }

  if ((msg.includes('order') || msg.includes('delivery')) && msg.includes('manage')) {
    return { name: 'Order Management', path: '/cafe-order-control' };
  }





  if (msg.includes('map') || 
      (msg.includes('campus') && msg.includes('navigation')) ||
      (msg.includes('find') && (msg.includes('building') || msg.includes('location'))) || 
      msg.includes('direction') || 
      msg.includes('navigate to') || 
      msg.includes('where is')) {
    return { name: 'Campus Map', path: '/map' };
  }


  return null;
}


async function handleWithSpecializedFunctions(query) {
  try {
    // Check for KUET FAQ matches first
    const faqAnswer = findFaqAnswer(query);
    if (faqAnswer) {
      return faqAnswer;
    }
    
    // Continue with existing specialized functions
    if (query.includes('pending') || query.includes('approval')) {
      return await getPendingApprovalCount();
    }
    else if (query.includes('revenue') || query.includes('sales')) {
      return await getRevenueInfo();
    }

    return null;
  } catch (error) {
    console.error('Error in specialized functions:', error);
    return null;
  }
}


// Update the askGemini function to provide more context about the application
async function askGemini(message, history) {
  try {
    if (!genAI) {
      return "I'm sorry, my AI capabilities are currently limited. Please try again later.";
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Provide context about the entire application, not just cafe management
    const prompt = `You are a helpful AI assistant for Khulna University of Engineering & Technology (KUET) campus application that includes:
- Cafeteria service with meal ordering
- User profiles and accounts
- Cafeteria food including cart and preorder
- Order history and tracking
- Admin features for cafe managers
- Provide Bus Scheduling
- Provide assignment update and routine
- Provide managing campus club events

About KUET:
- A leading public engineering university in Bangladesh
- Founded in 1967 (initially as Khulna Engineering College)
- Located in Khulna, Bangladesh
- Offers various undergraduate and graduate engineering programs
- Known for academic excellence and research
- Has strong alumni network
- Has a strong research culture
- Has a strong industry collaboration
- Has a strong international collaboration
- Has a strong national collaboration
- Has a strong regional collaboration
The user has asked: "${message}"

Provide a helpful, concise response. If you're not sure about specific details, be honest about what you don't know.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error with Gemini AI:', error);
    return "I'm having trouble connecting to my AI capabilities right now.";
  }
}

// Add to the end of the ai-cafe-manager.controller.js file

async function getPendingApprovalCount() {
  try {
    const count = await prisma.preorder.count({
      where: {
        status: 'pending_approval'
      }
    });

    return `There are ${count} orders pending your approval.`;
  } catch (error) {
    console.error("Error getting pending approvals:", error);
    return "I couldn't retrieve the pending approval count.";
  }
}

async function getRevenueInfo() {
  try {
    return "Revenue information is currently unavailable.";
  } catch (error) {
    console.error("Error getting revenue:", error);
    return "I couldn't retrieve revenue information.";
  }
}