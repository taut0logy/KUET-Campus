const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger.util');
const { sendSuccess, sendError } = require('../utils/response.util');
const { findFaqAnswer } = require('../utils/kuet-faqs.util');
const { vectorStore } = require('../utils/vector-store.util');
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

exports.processCafeManagerQuery = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return sendError(res, 'Message is required', 400);
    }

    logger.info(`Processing cafe manager query: ${message}`);

    // Check for navigation requests first
    const navigationDestination = getSimpleNavigationDestination(message);
    if (navigationDestination) {
      return sendSuccess(res, {
        response: `I'll take you to ${navigationDestination.name}.`,
        action: 'navigate',
        destination: navigationDestination.path,
        enhanced: false,
        sources: []
      });
    }

    // Then check for specialized data functions
    const specializedResponse = await handleWithSpecializedFunctions(message);
    if (specializedResponse) {
      return sendSuccess(res, {
        response: specializedResponse,
        action: 'display',
        enhanced: false,
        sources: []
      });
    }

    // Finally, use RAG-enhanced Gemini for general queries
    const ragResponse = await askGeminiWithRAG(message, history || []);
    
    return sendSuccess(res, {
      response: ragResponse.text,
      enhanced: ragResponse.enhanced,
      sources: ragResponse.sources,
      action: 'display'
    });
  } catch (error) {
    console.error('❌ Error in AI assistant:', error);
    logger.error(`AI assistant error: ${error.message}`);
    return sendError(res, `Error in AI assistant: ${error.message}`, 500);
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


async function askGeminiWithRAG(message, history) {
  try {
    if (!genAI) {
      return "I'm sorry, my AI capabilities are currently limited. Please try again later.";
    }

    console.log('🔍 Using RAG to find relevant information...');
    
    // Retrieve relevant documents based on the query
    const searchResults = await vectorStore.similaritySearch(message, 3);
    
    // Format the retrieved context
    let retrievedContext = '';
    if (searchResults && searchResults.length > 0) {
      retrievedContext = 'Here is some relevant information:\n\n';
      
      searchResults.forEach(result => {
        retrievedContext += `${result.document.text}\n\n`;
        console.log(`📄 Retrieved document: ${result.document.id} (score: ${result.score.toFixed(3)})`);
      });
    } else {
      console.log('⚠️ No relevant documents found in vector store');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format the prompt with retrieved information
    const prompt = `You are a helpful AI assistant for the Khulna University of Engineering & Technology (KUET) campus application.

The user has asked: "${message}"

${retrievedContext ? retrievedContext : "I don't have specific information about this query in my knowledge base."}

Based on the above information and your general knowledge, provide a helpful, concise, and accurate response. If the retrieved information doesn't fully answer the query, be honest about what you don't know.`;

    console.log('🚀 Sending RAG-enhanced prompt to Gemini');
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Return detailed information about the RAG process
    return {
      text: response,
      enhanced: searchResults && searchResults.length > 0,
      sources: searchResults ? searchResults.map(r => ({
        id: r.document.id,
        text: r.document.text.substring(0, 150) + '...',  // Preview of content
        metadata: r.document.metadata,
        score: r.score.toFixed(3)
      })) : []
    };
  } catch (error) {
    console.error('❌ Error with RAG-enhanced Gemini:', error);
    return {
      text: "I'm having trouble processing your request with my enhanced knowledge system.",
      enhanced: false,
      sources: []
    };
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
    return {
  text: response,
  enhanced: searchResults && searchResults.length > 0,
  sources: searchResults ? searchResults.map(r => ({
    id: r.document.id,
    score: r.score.toFixed(3)
  })) : []
};
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