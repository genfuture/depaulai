"use client";
import React, { useState } from 'react';

const ChatForm = ({
    onSendMessage,
}: {
    onSendMessage: (message: string) => void;
}) => {
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== "") {
            try {
                // Send the message to the Flask backend using fetch
                const response = await fetch('http://localhost:5328/backend/hack?query=some_query_value' + encodeURIComponent(message), {
                    method: 'GET', // Change to 'POST' if the backend expects POST
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Check if the response is successful
                if (response.ok) {
                    const data = await response.json();
                    console.log("Message sent successfully:", data);
                    onSendMessage(message);  // Call the onSendMessage function passed as a prop
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
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4 w-[80%] h-[75px]">
            <input
                onChange={(e) => setMessage(e.target.value)}
                type="text"
                className="bg-black text-white w-[100%] py-2 px-4 rounded"
                placeholder="Type your message here..."
                value={message}
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
