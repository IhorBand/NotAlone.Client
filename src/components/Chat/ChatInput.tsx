import './ChatInput.css';

import React, { useRef } from 'react';

export interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

const ChatInputComponent = (props: ChatInputProps) => {
    const message = useRef<HTMLTextAreaElement>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isMessageProvided = message && message.current && message.current.value !== '';

        if (isMessageProvided) {
            props.onSendMessage(message.current.value);
        } 
        else {
            alert('Please type something to send a message. Don\'t be a jerk !');
        }
    }

    return (
        <form 
            onSubmit={onSubmit} className="text-message-input-wrapper">
            <textarea 
                className="text-message-input"
                id="message"
                name="message"
                ref={message} />
            <button className="send-message-btn"></button>
        </form>
    )
};
export default ChatInputComponent;