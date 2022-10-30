import './ChatWindow.css';

import { MessageModel } from '../../models/MessageModel';

import Message from './Message';
import { useEffect, useRef, useState } from 'react';
import { RefObject } from 'react';

export interface ChatWindowProps {
	chatMessages: Array<MessageModel>;
    messageListDiv: RefObject<HTMLDivElement>;
}

const ChatWindow = (props : ChatWindowProps) => {
    const chat = props.chatMessages.map(m => <Message 
            key={m.id}
            id={m.id}
            userId={m.userId}
            userName={m.userName}
            message={m.message}/>);

    //const messageListDiv = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     if(messageListDiv && messageListDiv.current) {
    //         messageListDiv.current.scrollTop = messageListDiv.current.scrollHeight;
    //     }
    // }, 
    // [chat]);
    
    return(
        <div ref={props.messageListDiv} className='message-list'>
            {chat}
        </div>
    )
};

export default ChatWindow;