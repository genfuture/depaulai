import React, { useState, useEffect } from 'react';
import { User, Bot, Calendar } from 'lucide-react';
import { Message } from '../types';
import { extractDatesFromText, createDefaultEvent } from '../utils/calendarUtils';
import CalendarWidget from './CalendarWidget';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onResponseReceived?: (response: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isStreaming = false, 
  onResponseReceived 
}) => {
  const isUser = message.sender === 'user';
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Format the timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Extract dates from message content
  useEffect(() => {
    if (!isUser && message.content) {
      const extractedDates = extractDatesFromText(message.content);
      setDates(extractedDates);
    }
  }, [message.content, isUser]);

  // Call onResponseReceived when streaming is complete
  useEffect(() => {
    if (onResponseReceived && !isUser && message.content && !isStreaming) {
      onResponseReceived(message.content);
    }
  }, [message.content, isUser, isStreaming, onResponseReceived]);

  // Highlight dates in the message content
  const renderMessageContent = () => {
    if (!message.content && isStreaming) {
      return <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 animate-blink"></span>;
    }
    
    if (dates.length === 0 || !message.content) {
      return message.content;
    }

    let content = message.content;
    let parts = [];
    let lastIndex = 0;

    dates.forEach((date, index) => {
      const dateIndex = content.indexOf(date, lastIndex);
      if (dateIndex !== -1) {
        // Add text before the date
        if (dateIndex > lastIndex) {
          parts.push(content.substring(lastIndex, dateIndex));
        }
        
        // Add the date with highlighting and click handler
        parts.push(
          <button
            key={`date-${index}`}
            onClick={() => setSelectedDate(date)}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
          >
            <Calendar size={14} />
            {date}
          </button>
        );
        
        lastIndex = dateIndex + date.length;
      }
    });

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  // Create a default event from the selected date
  const getEventFromSelectedDate = () => {
    if (!selectedDate) return null;
    return createDefaultEvent(selectedDate, message.content);
  };

  return (
    <div 
      className={`flex items-start gap-4 p-4 mb-4 rounded-lg ${
        isStreaming && !message.content ? 'animate-pulse' : 'animate-fadeIn'
      } ${
        isUser 
          ? 'bg-blue-50 dark:bg-blue-900/20' 
          : 'bg-gray-50 dark:bg-gray-700/30'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200' 
          : 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-200'
      }`}>
        {isUser ? (
          <User size={16} />
        ) : (
          <div className="w-full h-full overflow-hidden rounded-full">
            <img 
              src="https://depauliaonline.com/wp-content/uploads/2017/09/Depaul.png" 
              alt="DePaul Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'DePaul'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap">
          {renderMessageContent()}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-500 animate-blink ml-1"></span>
          )}
        </div>
        
        {/* Calendar Widget */}
        {selectedDate && getEventFromSelectedDate() && (
          <div className="mt-4">
            <CalendarWidget 
              event={getEventFromSelectedDate()!} 
              onClose={() => setSelectedDate(null)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;