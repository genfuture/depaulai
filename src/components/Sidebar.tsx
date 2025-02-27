import React from 'react';
import { Plus, Moon, Sun, User, Settings, LogOut, X, Github } from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onCloseSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onCloseSidebar,
  darkMode,
  onToggleDarkMode
}) => {
  // Format date for chat history
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with close button on mobile */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-lg text-blue-600 dark:text-blue-400">DEPAUL AI</h2>
        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          onClick={onCloseSidebar}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg text-left mb-1 transition-colors ${
                chat.id === currentChatId
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex-1 truncate">
                <div className="font-medium dark:text-white truncate">{chat.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(chat.timestamp)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User size={18} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <div className="font-medium dark:text-white">User Profile</div>
            </div>
          </div>
        </div>

        {/* Settings and Theme Toggle */}
        <div className="p-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <Settings size={18} />
          </button>
          <button 
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a 
            href="https://github.com/genfuture/depaulai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <Github size={18} />
          </a>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;