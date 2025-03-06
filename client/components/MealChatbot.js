"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function MealChatbot({ meals }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock AI processing - replace with actual API call
  const processQuery = async (query) => {
    // Simple keyword matching for demo purposes
    const keywords = {
      'protein': 'high-protein',
      'workout': 'high-protein',
      'vegetarian': 'vegetarian',
      'vegan': 'vegan',
      'energy': 'high-carb',
      'light': 'low-calorie',
      'healthy': 'balanced'
    };

    const matchedKeywords = Object.keys(keywords).filter(key => 
      query.toLowerCase().includes(key)
    );

    return matchedKeywords.map(key => keywords[key]);
  };

  const findMatchingMeals = (criteria) => {
    return meals.filter(meal => {
      return criteria.some(c => 
        meal.tags?.includes(c) || 
        meal.description?.toLowerCase().includes(c)
      );
    }).slice(0, 3);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = { text: inputMessage, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Process query
      const criteria = await processQuery(inputMessage);
      const suggestedMeals = findMatchingMeals(criteria);
      
      // Add bot response
      const botMessage = {
        text: suggestedMeals.length > 0 
          ? "Here are some recommendations based on your needs:" 
          : "I couldn't find matching meals. Try being more specific!",
        isBot: true,
        meals: suggestedMeals
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble processing your request.", 
        isBot: true 
      }]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl">Meal Assistant</CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe your needs (e.g., `&quot;`I need post-workout protein`&quot;`)
        </p>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg h-96 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-4 rounded-lg ${
                    message.isBot 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <p>{message.text}</p>
                  {message.meals && (
                    <div className="mt-4 space-y-2">
                      {message.meals.map(meal => (
                        <div key={meal.id} className="p-2 rounded bg-white dark:bg-gray-700">
                          <p className="font-semibold">{meal.name}</p>
                          <p className="text-sm opacity-75">{meal.description}</p>
                          <p className="text-sm">${meal.price}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}