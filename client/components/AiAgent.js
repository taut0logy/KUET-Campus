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
import axios from '@/lib/axios';;

export default function AiAgent() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedMessageIndex, setExpandedMessageIndex] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I'm your KUET Campus assistant. How can I help you today?"
    },
    {
      role: 'assistant',
      content: "I'm powered by Retrieval Augmented Generation (RAG), which means I can retrieve specific information about KUET from our knowledge base to give you more accurate answers. Try asking me about departments, facilities, or other KUET-specific questions!",
      enhanced: true,
      demoInfo: true
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

  // Update the handleRefreshData function:

  const handleRefreshData = async () => {
    try {
      // Add a refreshing message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Refreshing data from database..." }
      ]);

      // Simple ping to wake up the API if it's sleeping
      await axios.get('/health'); // Changed from '/healthcheck'

      // Add a success message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Data refreshed! What would you like to know?" }
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
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
        content: description || `Navigating to ${path}...`
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
    const currentInput = input; // Save the input before clearing
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending request to AI assistant:', currentInput);

      // Use the correct endpoint path
      const response = await axios.post('/ai/cafe-assistant', {
        message: currentInput,
        history: messages.slice(-5) // Send last 5 messages for context
      });

      console.log('Response from AI assistant:', response.data);

      if (response.data && response.data.data) {
        // Add the AI response to messages with RAG info
        const aiMessage = {
          role: 'assistant',
          content: response.data.data.response,
          enhanced: response.data.data.enhanced === true,
          sources: response.data.data.sources || []
        };

        setMessages((prev) => [...prev, aiMessage]);

        // If it's a navigation request, navigate to the destination
        if (response.data.data.action === 'navigate' && response.data.data.destination) {
          setTimeout(() => {
            router.push(response.data.data.destination);
          }, 800);
        }
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      // Error handling code...
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandedMessage = (index) => {
    if (expandedMessageIndex === index) {
      setExpandedMessageIndex(null);
    } else {
      setExpandedMessageIndex(index);
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
        <Card className={`fixed z-50 bottom-4 right-4 w-96 ${isMinimized ? 'h-14' : 'h-[550px]'} shadow-lg transition-all duration-200`}>
          <CardHeader className="p-3 border-b flex flex-row justify-between items-center cursor-pointer" onClick={handleToggleMinimize}>
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <Bot className="h-4 w-4" />
              </Avatar>
              <span className="font-medium">KUET Campus Assistant</span>
              
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
              <ScrollArea className="h-[calc(550px-130px)] p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} mb-4 w-full`}
                      >
                        <div
                          className={`p-3 rounded-lg ${message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                            } ${message.role === 'assistant' ? 'max-w-[95%]' : ''}`}
                        >
                          {message.content}

                          {/* Show badge for RAG-enhanced responses */}
                          {message.role === 'assistant' && message.enhanced && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleExpandedMessage(index)}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500 text-white hover:bg-blue-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                RAG Enhanced • View Sources ({message.sources?.length || 0})
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Expanded RAG Information - MOVED INSIDE THE MAP LOOP */}
                        {message.role === 'assistant' &&
                          message.enhanced &&
                          expandedMessageIndex === index &&
                          message.sources && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                              <div className="text-sm font-medium text-blue-800 mb-2">
                                RAG Retrieval Details (Hackathon Demo)
                              </div>

                              {message.sources.map((source, i) => (
                                <div key={i} className="mb-3 pb-3 border-b border-blue-100 last:border-b-0">
                                  <div className="flex justify-between">
                                    <span className="text-xs font-semibold text-blue-700">Source {i + 1}: {source.id}</span>
                                    <span className="text-xs font-medium bg-blue-200 px-1 rounded">
                                      Relevance: {source.score}
                                    </span>
                                  </div>
                                  <div className="text-xs mt-1 text-gray-700 bg-white p-2 rounded">
                                    {source.text}
                                  </div>
                                </div>
                              ))}

                              <div className="text-xs text-blue-600 italic mt-2">
                                This response was generated using Retrieval Augmented Generation (RAG), which enhances the AI`&apos;`s knowledge with specific information from the KUET knowledge base.
                              </div>
                            </div>
                          )}
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