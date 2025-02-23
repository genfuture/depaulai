"use client";
import Image from "next/image";
import ChatForm from "./components/chat/chatform";

export default function Home() {
  const handleSendMessage = (message: string) => {
    console.log(message);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div>
        TODO: add chat room messaage renderer
      </div>
      <ChatForm onSendMessage={handleSendMessage} />
    </div>
  );
}