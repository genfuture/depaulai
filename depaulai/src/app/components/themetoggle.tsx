// src/app/components/themetoggle.tsx (Client-side component)

'use client'; // This ensures that the component is client-side only

import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Set the initial theme based on user's system preference or stored theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme as 'light' | 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Save theme to localStorage
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded p-2 bg-blue-500 text-white"
    >
      Toggle Theme
    </button>
  );
};

export default ThemeToggle;
