const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger.util');
const { sendSuccess, sendError } = require('../utils/response.util');

const prisma = new PrismaClient();

/**
 * Process queries from cafe managers and provide database insights
 */
exports.processCafeManagerQuery = async (req, res) => {
  try {
    const { message, history } = req.body;
    const query = message.toLowerCase();
    
    // Handle different types of queries
    let response;
    
    // Pending orders (fix for this specific issue)
    if (
      query.includes('pending') || 
      query.includes('approval') || 
      query.includes('need action') ||
      query.includes('waiting for review') ||
      (query.includes('any') && query.includes('new') && query.includes('order'))
    ) {
      response = await getPendingApprovalCount();
    }
    // Sales and revenue questions
    else if (
      query.includes('revenue') || 
      query.includes('sales') || 
      query.includes('earning') ||
      query.includes('money') ||
      query.includes('income')
    ) {
      response = await getRevenueInfo();
    } 
    // Popular meals
    else if (
      query.includes('popular') || 
      (query.includes('top') && query.includes('meal')) ||
      query.includes('best seller') ||
      query.includes('most ordered')
    ) {
      response = await getPopularMeals();
    } 
    // Order statistics
    else if (
      query.includes('order') && 
      (query.includes('count') || query.includes('number') || query.includes('total') || query.includes('statistics') || query.includes('status'))
    ) {
      response = await getOrdersInfo();
    }
    // Meal counts
    else if (
      (query.includes('how many') || query.includes('total') || query.includes('count')) && 
      (query.includes('meal') || query.includes('food') || query.includes('item'))
    ) {
      response = await getMealCounts();
    }
    // Orders ready for pickup
    else if (
      (query.includes('ready') && query.includes('pickup')) ||
      query.includes('to be picked up') ||
      query.includes('for collection')
    ) {
      response = await getReadyOrdersCount();
    }
    // Today's orders
    else if (
      (query.includes('today') || query.includes('current day')) && 
      query.includes('order')
    ) {
      response = await getTodayOrders();
    }
    // Recent activity
    else if (
      query.includes('recent') || 
      query.includes('latest') ||
      query.includes('new activity') ||
      query.includes('what happened')
    ) {
      response = await getRecentActivity();
    }
    // Specific meal info
    else if (
      query.includes('meal') && 
      (query.includes('find') || query.includes('information') || query.includes('details') || query.includes('about'))
    ) {
      const mealName = extractMealName(query);
      if (mealName) {
        response = await getMealInfo(mealName);
      } else {
        response = "I couldn't identify which meal you're asking about. Could you specify the meal name?";
      }
    }
    // Help with using the system
    else if (
      query.includes('help') || 
      query.includes('how do i') || 
      query.includes('how to') ||
      query.includes('what can you do')
    ) {
      response = getHelpResponse(query);
    }
    // Default response for unrecognized queries
    else {
      response = "I'm not sure how to answer that. You can ask me about orders, meals, revenue, or navigation. For example, try 'How many pending orders do we have?' or 'Take me to meal management'";
    }

    return sendSuccess(res, { response });
  } catch (error) {
    logger.error('Error in AI assistant:', error);
    return sendError(res, 'Failed to process your request', 500);
  }
};

// Helper functions to fetch data from database

// Improved pending approval count function
async function getPendingApprovalCount() {
  const count = await prisma.preorder.count({
    where: {
      status: 'pending_approval'
    }
  });
  
  // Get the most recent pending orders
  const pendingOrders = await prisma.preorder.findMany({
    where: {
      status: 'pending_approval'
    },
    include: {
      user: true,
      meal: true
    },
    orderBy: {
      orderTime: 'desc'
    },
    take: 3
  });
  
  if (count === 0) {
    return "There are no orders pending approval. All orders have been processed!";
  } else {
    let response = `There are ${count} orders pending your approval.`;
    
    if (pendingOrders.length > 0) {
      response += "\n\nMost recent pending orders:";
      pendingOrders.forEach((order, index) => {
        response += `\n${index + 1}. ${order.meal.name} - ordered by ${order.user.firstName} ${order.user.lastName} at ${new Date(order.orderTime).toLocaleTimeString()}`;
      });
      response += "\n\nYou should review them in the order management section.";
    }
    
    return response;
  }
}

async function getRevenueInfo() {
  // Calculate revenue from orders
  const result = await prisma.preorder.aggregate({
    _sum: {
      total: true
    },
    where: {
      status: 'picked_up'  // Only count completed orders
    }
  });
  
  const totalRevenue = result._sum.total || 0;
  
  // Get today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayResult = await prisma.preorder.aggregate({
    _sum: {
      total: true
    },
    where: {
      status: 'picked_up',
      orderTime: {
        gte: today
      }
    }
  });
  
  const todayRevenue = todayResult._sum.total || 0;
  
  // Get yesterday's revenue for comparison
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const yesterdayResult = await prisma.preorder.aggregate({
    _sum: {
      total: true
    },
    where: {
      status: 'picked_up',
      orderTime: {
        gte: yesterday,
        lt: today
      }
    }
  });
  
  const yesterdayRevenue = yesterdayResult._sum.total || 0;
  
  // Calculate percentage change
  const percentChange = yesterdayRevenue ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  
  let trendMessage = "";
  if (Math.abs(percentChange) > 1) {
    trendMessage = `This is ${percentChange > 0 ? 'up' : 'down'} ${Math.abs(percentChange).toFixed(1)}% compared to yesterday.`;
  } else {
    trendMessage = "This is about the same as yesterday.";
  }
  
  return `Total revenue from all completed orders is ৳${totalRevenue.toLocaleString()}. Today's revenue so far is ৳${todayRevenue.toLocaleString()}. ${trendMessage}`;
}

async function getPopularMeals() {
  const popularMeals = await prisma.preorder.groupBy({
    by: ['mealId'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 5
  });
  
  if (popularMeals.length === 0) {
    return "There are no orders yet to determine popular meals.";
  }
  
  // Get meal names
  const mealIds = popularMeals.map(item => item.mealId);
  const meals = await prisma.meal.findMany({
    where: {
      id: { in: mealIds }
    },
    select: {
      id: true,
      name: true,
      price: true
    }
  });
  
  const mealsMap = meals.reduce((acc, meal) => {
    acc[meal.id] = meal;
    return acc;
  }, {});
  
  const topMealsText = popularMeals
    .map((item, index) => `${index + 1}. ${mealsMap[item.mealId].name} (${item._count.id} orders) - ৳${mealsMap[item.mealId].price} each`)
    .join('\n');
  
  const totalRevenue = popularMeals.reduce((sum, item) => {
    return sum + (item._count.id * (mealsMap[item.mealId]?.price || 0));
  }, 0);
  
  return `Top selling meals:\n${topMealsText}\n\nThese top 5 meals have generated approximately ৳${totalRevenue.toLocaleString()} in revenue.`;
}

async function getOrdersInfo() {
  const totalOrders = await prisma.preorder.count();
  
  const statusCounts = await prisma.preorder.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });
  
  const statusMap = {
    pending_approval: 'pending approval',
    placed: 'placed',
    ready: 'ready for pickup',
    picked_up: 'completed',
    cancelled: 'cancelled'
  };
  
  const statusData = statusCounts.map(item => ({
    status: statusMap[item.status] || item.status,
    count: item._count.id,
    percentage: Math.round((item._count.id / totalOrders) * 100)
  }));
  
  const statusText = statusData
    .map(item => `${item.status}: ${item.count} (${item.percentage}%)`)
    .join('\n');
  
  // Get today's order count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrderCount = await prisma.preorder.count({
    where: {
      orderTime: {
        gte: today
      }
    }
  });
  
  return `Order Statistics:\n\nTotal orders in system: ${totalOrders}\nOrders today: ${todayOrderCount}\n\nBreakdown by status:\n${statusText}`;
}

async function getTodayOrders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = await prisma.preorder.count({
    where: {
      orderTime: {
        gte: today
      }
    }
  });
  
  if (todayOrders === 0) {
    return "There have been no orders placed today yet.";
  }
  
  // Get status breakdown for today's orders
  const statusCounts = await prisma.preorder.groupBy({
    by: ['status'],
    _count: {
      id: true
    },
    where: {
      orderTime: {
        gte: today
      }
    }
  });
  
  const statusMap = {
    pending_approval: 'pending approval',
    placed: 'placed',
    ready: 'ready for pickup',
    picked_up: 'completed',
    cancelled: 'cancelled'
  };
  
  const statusText = statusCounts
    .map(item => `${statusMap[item.status] || item.status}: ${item._count.id}`)
    .join('\n');
  
  const revenue = await prisma.preorder.aggregate({
    _sum: {
      total: true
    },
    where: {
      orderTime: {
        gte: today
      },
      status: {
        not: 'cancelled'
      }
    }
  });
  
  const totalRevenue = revenue._sum.total || 0;
  
  return `Today's Order Summary:\n\nTotal orders: ${todayOrders}\nTotal revenue: ৳${totalRevenue.toLocaleString()}\n\nStatus breakdown:\n${statusText}`;
}

async function getMealCounts() {
  const totalMeals = await prisma.meal.count();
  
  const categories = await prisma.meal.groupBy({
    by: ['category'],
    _count: {
      id: true
    }
  });
  
  const categoriesText = categories
    .map(cat => `${cat.category}: ${cat._count.id}`)
    .join('\n');
  
  // Get average price
  const priceData = await prisma.meal.aggregate({
    _avg: {
      price: true
    },
    _min: {
      price: true
    },
    _max: {
      price: true
    }
  });
  
  return `Meal Statistics:\n\nTotal meals: ${totalMeals}\nAverage price: ৳${priceData._avg.price.toFixed(2)}\nPrice range: ৳${priceData._min.price} - ৳${priceData._max.price}\n\nBreakdown by category:\n${categoriesText}`;
}

async function getReadyOrdersCount() {
  const count = await prisma.preorder.count({
    where: {
      status: 'ready'
    }
  });
  
  if (count === 0) {
    return "There are no orders ready for pickup at the moment.";
  } 
  
  // Get ready orders with customer info
  const readyOrders = await prisma.preorder.findMany({
    where: {
      status: 'ready'
    },
    include: {
      user: true,
      meal: true
    },
    orderBy: {
      pickupTime: 'asc'
    },
    take: 5
  });
  
  let response = `There are ${count} orders ready for customer pickup.`;
  
  if (readyOrders.length > 0) {
    response += "\n\nNext scheduled pickups:";
    readyOrders.forEach((order, index) => {
      const pickupTime = new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      response += `\n${index + 1}. ${order.meal.name} for ${order.user.firstName} ${order.user.lastName} at ${pickupTime}`;
    });
  }
  
  return response;
}

async function getRecentActivity() {
  // Get the 5 most recent orders
  const recentOrders = await prisma.preorder.findMany({
    include: {
      user: true,
      meal: true
    },
    orderBy: {
      orderTime: 'desc'
    },
    take: 5
  });
  
  if (recentOrders.length === 0) {
    return "There has been no recent activity in the system.";
  }
  
  let response = "Recent activity:\n";
  
  recentOrders.forEach((order, index) => {
    const orderTime = new Date(order.orderTime).toLocaleString();
    const status = order.status.replace(/_/g, ' ');
    response += `\n${index + 1}. ${order.user.firstName} ${order.user.lastName} ${status === 'pending approval' ? 'requested' : 'ordered'} ${order.meal.name} (${orderTime})`;
  });
  
  return response;
}

// Other helper functions remain the same...

module.exports = {
  processCafeManagerQuery
};