"use client";
import ChatForm from "./components/chat/chatform";
import { useState } from "react";
import Messages from "./components/chat/messages";

export default function Home() {
  const [messages, setMessages] = useState<
  {sender: string, message: string}[]>([]);

  const handleSendMessage = (message: string) => {
    console.log(message);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-[80%] overflow-y-auto p-4 bg-gray-900 border-2 border-black">
        {messages.map((msg, index) => (
          <Messages
            key={index}
            sender={msg.sender}
            message={msg.message}
            isOwnMessage={msg.sender === "You"}
          />
        ))}
      </div>
      <ChatForm onSendMessage={handleSendMessage} />
    </div>
  );
}