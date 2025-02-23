"use client";
import React, { useState } from 'react';

const ChatForm = ({
    onSendMessage,
}: {
    onSendMessage: (message: string) => void;
}) => {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== "") {
            onSendMessage(message);
            setMessage("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4 w-[80%] h-[75px]">
            <input
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                className="bg-black text-white w-[100%] py-2 px-4 rounded"
                placeholder="Type your message here..."
            />
            <button
                type="submit"
                className="bg-white-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                Send
            </button>
        </form>
    );
};

export default ChatForm;