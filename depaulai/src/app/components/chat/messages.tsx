import { send } from 'process';
import React from 'react'


interface ChatMesaageProps{
    sender: string;
    message: string;
    isOwnMessage: boolean;
}

const Messages:React.FC<ChatMesaageProps> =({sender, message, isOwnMessage}) => {
  const isSystemMessage = sender === "Depaul Friend";
  return (
    <div 
      className={`flex ${isSystemMessage ? "justify-center" : isOwnMessage ? "justify-end" : "justify-start"} mb-3`}
    >
      <div 
        className={`max-w-xs ${
          isSystemMessage ? "bg-gray-200" : isOwnMessage ? "bg-gray-400" : ""
        } w-full p-2`}
      >
        {isSystemMessage && <p>Depaul Friend</p>}
        {isOwnMessage && <p>You</p>}
        <p>{message}</p>
      </div>
    </div>
  )
}

export default Messages
