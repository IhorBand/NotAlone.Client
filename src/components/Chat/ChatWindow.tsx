import './ChatWindow.css';

import { MessageModel } from '../../models/MessageModel';

import Message from './Message';
import { useEffect, useRef } from 'react';

export interface ChatWindowProps {
	chatMessages: Array<MessageModel>;
}

const ChatWindow = (props : ChatWindowProps) => {
    const chat = props.chatMessages
        .reverse().map(m => <Message 
            key={Date.now() * Math.random()}
            userId={m.userId}
            userName={m.userName}
            message={m.message}/>);

    const messageListDiv = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if(messageListDiv && messageListDiv.current) {
            messageListDiv.current.scrollTop = messageListDiv.current.scrollHeight;
        }
    }, 
    [chat]);
    
    return(
        <div ref={messageListDiv} className='message-list'>
            {chat}
        </div>
    )
};

export default ChatWindow;