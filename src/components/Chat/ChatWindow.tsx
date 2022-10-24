import './ChatWindow.css';

import { MessageModel } from '../../models/MessageModel';

import Message from './Message';

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
    return(
        <div>
            {chat}
        </div>
    )
};

export default ChatWindow;