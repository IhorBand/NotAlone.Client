import './MessageNotification.css';

import { MessageModel } from '../../models/MessageModel';

import ihorAvatar from "../../images/ihor_smaller.jpg"
import oldIhorAvatar from "../../images/oldihor.jpg"
import oldRomavatar from "../../images/oldroma.jpg"
import andrewAvatar from "../../images/andrew.jpg"
import romaAvatar from "../../images/roma_2.jpg"
import capibaraAvatar from "../../images/capibara.jpg"

const MessageNotificationComponent = (props: MessageModel) => {
    return (
        <div className="">
            <div className='fullscreen-message-item'>
                <div className='user-avatar-wrapper'>
                    {props.userName==='Rom4ik' ? <img className='user-avatar' src="https://static8.tgstat.ru/channels/_0/90/908e7729970bbb8837e0f4e5e83b15da.jpg" /> : 
                    props.userName==='s1lence' ? <img className='user-avatar' src={romaAvatar} /> :
                    props.userName==='Andrew' ? <img className='user-avatar' src={andrewAvatar} /> :
                    props.userName==='Ihor' ? <img className='user-avatar' src={ihorAvatar} /> : 
                    props.userName==='Capibara' ? <img className='user-avatar' src={capibaraAvatar} /> : 
                    <img className='user-avatar' src={oldIhorAvatar} />}
                </div>
                <div className='user-info'>
                    <div className='user-name'>{props.userName}</div>
                    <div className='user-message'>{props.message}</div>
                </div>
            </div>
        </div>
    )
};

export default MessageNotificationComponent;