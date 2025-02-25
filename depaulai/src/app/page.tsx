"use client";
import ChatForm from "./components/chat/chatform";
import { useState } from "react";
import Messages from "./components/chat/messages";

export default function Home() {
  const [messages, setMessages] = useState<{ sender: string, message: string }[]>([]);

  const handleSendMessage = (message: string) => {
    console.log(message);
    setMessages((prevMessages) => [...prevMessages, { sender: 'You', message }]);
  };

  return (
    <main className='relative h-full w-full flex flex-col'>
      <div className="flex-1 max-h-[75vh] overflow-y-auto">
        {messages.map((msg, index) => (
          <div className="flex-reverse flex-col overflow-y-auto" key={index}>
          <Messages key={index} sender={msg.sender} message={msg.message} />
          <Messages sender="Depaul Friend" message="Hello" />
          </div>
        ))}
      </div>
      <div>
      <ChatForm onSendMessage={handleSendMessage} />
      </div>
    </main>
  );
}