import React from 'react';
import { Menu, Moon, Sun, Settings, Github } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onMenuClick, 
  darkMode, 
  onToggleDarkMode 
}) => {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button 
          className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 mr-2"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        {/* <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400 mr-4">DEPAUL AI</h1> */}
        <h2 className="text-md font-medium truncate dark:text-white">{title}</h2>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <a 
          href="https://github.com/genfuture/depaulai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label="GitHub"
        >
          <Github size={18} />
        </a>
        <button 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;