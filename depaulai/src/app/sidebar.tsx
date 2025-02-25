'use client';

import React, { useState } from 'react';
//add new chat


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Toggle sidebar open/close
  const chats = ["world","hellow"];
  const chatList = [chats];
  

  return (
    <div className="flex">
      <div
        className={`transition-all bg-[#0E4174] h-full p-4 ${isOpen ? 'w-64' : 'w-20'}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white bg-gray-600 p-2 rounded"
        >
          {isOpen ? '>' : '<'}
        </button>

        {isOpen && (
          <>
            <div className="mt-4">
              <button type='button' className="bg-[#0057B7] text-white p-2 rounded-lg">
                New Chat +
              </button>

              {/* Future functionality: Add onClick handler for creating a new chat */}
              {/* You can implement the functionality for creating new chats here */}
            </div>

            {chatList.map((chat, index) => (
              <div key={index} className="mt-4">
                <button
                  type="button"
                  onClick={chat.onClick}
                  className="bg-[#0057B7] text-white pl-5 pr-5 p-2 rounded-lg"
                >
                  {chatList[index]}
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;