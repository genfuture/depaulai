'use client';

import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Toggle sidebar open/close
  const chats = ["world", "hellow"];
  
  return (
    <div className="flex">
      <div
        className={`transition-all bg-[#0E4174] h-full p-4 ${isOpen ? 'w-64' : 'w-20'} relative`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white bg-gray-600 p-2 rounded absolute top-4 right-4"
        >
          {isOpen ? '>' : '<'}
        </button>

        {isOpen && (
          <>
            <div className="mt-8">
              <button type="button" className="bg-[#0057B7] text-white p-2 rounded-lg w-full">
                New Chat +
              </button>
            </div>

            <div className="mt-6">
              {chats.map((chat, index) => (
                <div key={index} className="mt-4">
                  <button
                    type="button"
                    className="bg-[#0057B7] text-white pl-5 pr-5 p-2 rounded-lg w-full"
                  >
                    {chat}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
