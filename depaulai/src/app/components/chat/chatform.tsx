"use client";
import React from 'react';
import { useState } from 'react';



const ChatForm = ({
    onSendMessage,
}: {
    onSendMessage: (message: string) => void;
}) => {
    const [message, setMessage] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(message.trim() !== ""){
            onSendMessage(message);
        setMessage("");
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input 
            onChange={(e) => setMessage(e.target.value)}
            type="text" className="flex-1" 
            placeholder="Type your message here..." 
            />
            <button type='submit' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send</button>
        </form>
    );
};

export default ChatForm;