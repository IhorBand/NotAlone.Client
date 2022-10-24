import './ChatInput.css';

import React, { useRef } from 'react';

export interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

const ChatInputComponent = (props: ChatInputProps) => {
    const message = useRef<HTMLInputElement>(null);

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
            onSubmit={onSubmit}>
            <label htmlFor="message">Message:</label>
            <br />
            <input 
                type="text"
                id="message"
                name="message"
                ref={message} />
            <br/><br/>
            <button>Submit</button>
        </form>
    )
};
export default ChatInputComponent;