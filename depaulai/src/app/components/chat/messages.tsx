import React from 'react';

type MessageProps = {
    sender: string;      // Sender name or identifier
    message: string;     // Message content// Flag to check if the message is from the current user
};

const Messages = ({ sender, message }: MessageProps) => {
    return (
        <div className='flex flex-col-reverse p-2'>
            <p><strong>{sender}:</strong> {message}</p>
        </div>
    );
};

export default Messages;