import './Message.css';

import { MessageModel } from '../../models/MessageModel';

const MessageComponent = (props: MessageModel) => {
    return (
        <div style={{ background: "#eee", borderRadius: '5px', padding: '0 10px' }}>
            <p><strong>{props.userName}</strong>:</p>
            <br />
            <p>{props.message}</p>
        </div>
    )
};

export default MessageComponent;
