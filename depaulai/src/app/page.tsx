'use client';

import { useState, useEffect, useRef } from "react";
import ChatForm from "./components/chat/chatform";
import Messages from "./components/chat/messages";
import RootLayout from './components/root-layout';

export default function Home() {
  const [messages, setMessages] = useState<{ sender: string, message: string }[]>([]);
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // Create a reference for the chat container

  const handleSendMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, { sender: 'You', message }]);
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Runs when messages change (i.e., when a new message is sent)

  return (
    <RootLayout>
      <main className="relative h-full w-full flex flex-col">
        <div
          className="flex-1 max-h-[75vh] overflow-y-auto"
          ref={chatContainerRef} // Attach the ref to the chat container
        >
          {messages.map((msg, index) => (
            <div className="flex-reverse flex-col overflow-y-auto" key={index}>
              <Messages sender={msg.sender} message={msg.message} />
              <Messages sender="Depaul Friend" message="Hello" />
            </div>
          ))}
        </div>
        <div>
          <ChatForm onSendMessage={handleSendMessage} />
        </div>
      </main>
    </RootLayout>
  );
}
