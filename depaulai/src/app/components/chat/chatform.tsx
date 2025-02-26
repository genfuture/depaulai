"use client";
import React, { useState } from 'react';
import Messages from './messages';

const ChatForm = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ sender: string; message: string;}[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== "") {
            try {
                // Send the message to the Flask backend using fetch
                const response = await fetch('http://localhost:5328/backend/hack?query=' + encodeURIComponent(message), {
                    method: 'GET',  // Change to 'POST' if necessary
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Check if the response is successful
                if (response.ok) {
                    const data = await response.json();
                    console.log("Message sent successfully:", data);
                    
                    // Add the user's sent message to the messages state
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { sender: 'You', message: message, isOwnMessage: true },
                    ]);

                    // Add the backend response to the messages state
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { sender: 'Depaul Friend', message: data.message, isOwnMessage: false },
                    ]);

                    onSendMessage(message); // Call the onSendMessage function passed as a prop
                    setMessage(""); // Clear the input field
                } else {
                    console.error("Error sending message:", response.statusText);
                }
            } catch (error) {
                console.error("Error in fetch:", error);
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex gap-2 mt-4 w-[80%] h-[75px]">
                <input
                    onChange={(e) => setMessage(e.target.value)}
                    type="text"
                    className="w-[100%] py-2 px-4 rounded"
                    placeholder="Type your message here..."
                    value={message}
                />
                <button
                    type="submit"
                    className="bg-[#0E4174] hover:bg-[#0057B7] text-white font-bold py-2 px-4 rounded"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatForm;
