'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, X, Send, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import axios from '@/lib/axios';

export default function CafeAiAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your cafe management assistant. Ask me anything about your cafe or tell me where you'd like to go."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const handleToggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleRefreshData = async () => {
    try {
      // Add a refreshing message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Refreshing data from database..." }
      ]);

      // Simple ping to wake up the API if it's sleeping
      await axios.get('/healthcheck');
      
      // Add a success message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Data refreshed! What would you like to know?" }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I couldn't refresh the data. The server might be unavailable." }
      ]);
    }
  };

  const navigateTo = (path, description) => {
    setMessages((prev) => [
      ...prev, 
      { 
        role: 'assistant', 
        content: description
      }
    ]);
    
    setTimeout(() => {
      router.push(path);
    }, 800);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check for navigation commands first
      const lowerInput = input.toLowerCase();
      
      // Dashboard navigation
      if (
        lowerInput.includes('dashboard') || 
        lowerInput.includes('analytics') ||
        lowerInput.includes('home') ||
        lowerInput.includes('main page') ||
        lowerInput.includes('statistics')
      ) {
        navigateTo('/cafe-dashboard', "Taking you to the dashboard now.");
        setIsLoading(false);
        return;
      }
      
      // Meal section navigation
      if (
        lowerInput.includes('meal') ||
        lowerInput.includes('food') ||
        lowerInput.includes('menu items')
      ) {
        navigateTo('/cafe-meal-control', "Navigating to meal management section.");
        setIsLoading(false);
        return;
      }
      
      // Order section navigation
      if (
        lowerInput.includes('order') || 
        lowerInput.includes('customer request') ||
        lowerInput.includes('purchase')
      ) {
        navigateTo('/cafe-order-control', "Taking you to order management.");
        setIsLoading(false);
        return;
      }

      // Refresh data request
      if (
        lowerInput.includes('refresh') ||
        lowerInput.includes('reload') ||
        lowerInput.includes('update data')
      ) {
        await handleRefreshData();
        setIsLoading(false);
        return;
      }

      // For other queries, use the backend endpoint
      const response = await axios.post('/api/ai/cafe-assistant', { 
        message: input,
        history: messages.slice(-5) // Send last 5 messages for context
      });

      if (response.data && response.data.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.data.response }
        ]);
      } else {
        throw new Error("Received invalid response from server");
      }
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      
      // More detailed error handling
      let errorMessage = "I'm sorry, I encountered an error processing your request.";
      
      if (error.response) {
        // Handle server errors
        if (error.response.status === 404) {
          errorMessage = "I couldn't connect to the database. The server endpoint might be missing.";
        } else if (error.response.status === 500) {
          errorMessage = "There was a problem with the server. Please try again later.";
        }
      } else if (error.request) {
        // Handle network errors
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button
          onClick={handleToggleOpen}
          className="fixed z-50 bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className={`fixed z-50 bottom-4 right-4 w-80 ${isMinimized ? 'h-14' : 'h-96'} shadow-lg transition-all duration-200`}>
          <CardHeader className="p-3 border-b flex flex-row justify-between items-center cursor-pointer" onClick={handleToggleMinimize}>
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <Bot className="h-4 w-4" />
              </Avatar>
              <span className="font-medium">Cafe Assistant</span>
            </div>
            <div className="flex items-center space-x-1">
              {!isMinimized && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefreshData();
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
              <X 
                className="h-4 w-4 ml-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }} 
              />
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(384px-110px)] p-4">
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.content.split('\n').map((line, i) => (
                            <span key={i}>
                              {line}
                              {i < msg.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted">
                          <span className="flex items-center gap-1">
                            Thinking
                            <span className="animate-bounce">.</span>
                            <span className="animate-bounce delay-100">.</span>
                            <span className="animate-bounce delay-200">.</span>
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              
              <CardFooter className="p-2 border-t">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button size="sm" type="submit" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
}