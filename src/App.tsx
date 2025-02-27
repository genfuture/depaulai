import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Send, Plus, Moon, Sun, User, Settings, LogOut } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Message, Chat } from './types';
import { isGreeting, isCommonQuestion, getGreetingResponse, getCapabilitiesResponse } from './utils/greetingUtils';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has a preference stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    // Check if user prefers dark mode at OS level
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Return true if saved theme is 'dark' or if no saved theme but OS prefers dark
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat>({
    id: '1',
    title: 'New Chat',
    timestamp: new Date(),
    messages: []
  });
  const [chats, setChats] = useState<Chat[]>([currentChat]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Typing state
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [streamContent, setStreamContent] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const [streamIndex, setStreamIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages, streamContent]);

  // Simulate typing effect for streaming response
  useEffect(() => {
    if (fullResponse && streamIndex < fullResponse.length) {
      const typingTimer = setTimeout(() => {
        setStreamContent(prevContent => prevContent + fullResponse.charAt(streamIndex));
        setStreamIndex(prevIndex => prevIndex + 1);
      }, 10); // Reduced from 25 to 10 to make typing faster
      
      return () => clearTimeout(typingTimer);
    } else if (fullResponse && streamIndex === fullResponse.length) {
      // When streaming is complete, add the message to the chat
      if (streamingMessage) {
        const finalAiMessage = {
          ...streamingMessage,
          content: fullResponse
        };

        const finalMessages = [...currentChat.messages, finalAiMessage];
        const finalChat = {
          ...currentChat,
          messages: finalMessages
        };
        
        setCurrentChat(finalChat);
        setChats(chats.map(chat => chat.id === currentChat.id ? finalChat : chat));
        setIsTyping(false);
        setStreamingMessage(null);
        setFullResponse('');
        setStreamIndex(0);
      }
    }
  }, [fullResponse, streamIndex, streamingMessage, currentChat, chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle local responses for greetings and common questions
  const handleLocalResponse = (userMessage: Message): boolean => {
    const userInput = userMessage.content.trim();
    
    // Check if the message is a greeting
    if (isGreeting(userInput)) {
      const response = getGreetingResponse();
      simulateLocalResponse(response);
      return true;
    }
    
    // Check if the message is a common question about capabilities
    if (isCommonQuestion(userInput)) {
      const response = getCapabilitiesResponse();
      simulateLocalResponse(response);
      return true;
    }
    
    return false;
  };

  // Simulate a local response with the typing effect
  const simulateLocalResponse = (responseText: string) => {
    // Create a placeholder for the AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date()
    };

    // Set the streaming message
    setStreamingMessage(aiMessage);
    setStreamContent('');
    setFullResponse(responseText);
    setStreamIndex(0);
    setIsTyping(true);
  };

  // Clean API response by removing the generic DePaul introduction
  const cleanApiResponse = (response: string): string => {
    // Common introductory phrases to remove
    const introPatterns = [
      /^DePaul University is a private Catholic research university located in Chicago, Illinois\. It was founded in 1898\.\s*/,
      /^DePaul University is a private Catholic research university located in Chicago, Illinois\. It was founded by the Vincentians in 1898 and is named after the 17th-century French priest Saint Vincent de Paul\. DePaul is the largest Catholic university in the U\.S\. by enrollment\. The university has two campuses located in Lincoln Park and the Loop\. DePaul is classified among "R2: Doctoral Universities – High research activity"\. The acceptance rate is 70%\.\s*/
    ];
    
    let cleanedResponse = response;
    
    // Try to match and remove each pattern
    for (const pattern of introPatterns) {
      cleanedResponse = cleanedResponse.replace(pattern, '');
    }
    
    return cleanedResponse.trim();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...currentChat.messages, userMessage];
    
    const updatedChat = {
      ...currentChat,
      messages: updatedMessages
    };
    
    setCurrentChat(updatedChat);
    setChats(chats.map(chat => chat.id === currentChat.id ? updatedChat : chat));
    setInputValue('');

    // Check if we should handle this message locally
    if (handleLocalResponse(userMessage)) {
      return; // Local response handled, no need to make API call
    }

    // Create a placeholder for the AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date()
    };

    // Set the streaming message
    setStreamingMessage(aiMessage);
    setStreamContent('');
    setFullResponse('');
    setStreamIndex(0);
    setIsTyping(true);

    try {
      // Use the API endpoint from environment variable
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: userMessage.content,
          model: "detrained"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Clean the response to remove generic DePaul introduction
      const cleanedResponse = cleanApiResponse(data.response || "I'm sorry, I couldn't generate a response.");
      
      // Set the full response to start the streaming effect
      setFullResponse(cleanedResponse);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Add a fallback message on error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I couldn't process your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      const finalChat = {
        ...currentChat,
        messages: finalMessages
      };
      
      setCurrentChat(finalChat);
      setChats(chats.map(chat => chat.id === currentChat.id ? finalChat : chat));
      setIsTyping(false);
      setStreamingMessage(null);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
  };

  const selectChat = (chatId: string) => {
    const selected = chats.find(chat => chat.id === chatId);
    if (selected) {
      setCurrentChat(selected);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleResponseReceived = (response: string) => {
    // This function can be used to handle any post-processing after a response is received
    console.log("Response received:", response.substring(0, 50) + "...");
  };

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-20 w-64 h-full transition-all duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`}
      >
        <Sidebar 
          chats={chats}
          currentChatId={currentChat.id}
          onNewChat={createNewChat}
          onSelectChat={selectChat}
          onCloseSidebar={() => setSidebarOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header 
          title={currentChat.title} 
          onMenuClick={toggleSidebar}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto">
            {currentChat.messages.length === 0 && !streamingMessage ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500 dark:text-gray-400">
                </div>
              </div>
            ) : (
              <>
                {currentChat.messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    onResponseReceived={handleResponseReceived}
                  />
                ))}
                
                {/* Streaming message */}
                {streamingMessage && (
                  <ChatMessage 
                    key={streamingMessage.id} 
                    message={{
                      ...streamingMessage,
                      content: streamContent
                    }} 
                    isStreaming={streamIndex < fullResponse.length}
                  />
                )}
              </>
            )}
            
            {isTyping && !streamContent && (
              <div className="flex items-center space-x-2 p-4 animate-pulse">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isTyping}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;