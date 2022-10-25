import './Message.css';

import { MessageModel } from '../../models/MessageModel';

const MessageComponent = (props: MessageModel) => {
    return (
        <div className='message-item'>
            <div className='user-avatar-wrapper'>
                <img className='user-avatar' src="https://static8.tgstat.ru/channels/_0/90/908e7729970bbb8837e0f4e5e83b15da.jpg" />
            </div>
            <div className='user-info'>
                <div className='user-name'>{props.userName}</div>
                <div className='user-message'>{props.message}</div>
            </div>
        </div>
    )
};

export default MessageComponent;
