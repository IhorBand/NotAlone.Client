import './ChatInput.css';

import React, { KeyboardEvent, useRef } from 'react';

export interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

const ChatInputComponent = (props: ChatInputProps) => {
    const message = useRef<HTMLTextAreaElement>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage();
    }

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    }

    const sendMessage = () => {
        const isMessageProvided = message && message.current && message.current.value !== '' && message.current.value.trim() !== '';

        if (isMessageProvided) {
            props.onSendMessage(message.current.value);
            message.current.value = '';
            message.current.focus();
        } 
        else {
            alert('Please type something to send a message. Don`t be a jerk !');
        }
    }


    return (
        <form 
            onSubmit={onSubmit} className="text-message-input-wrapper">
            <textarea 
                className="text-message-input"
                id="message"
                name="message"
                ref={message}
                onKeyDown={onKeyDown} />
            <button className="send-message-btn"></button>
        </form>
    )
};
export default ChatInputComponent;