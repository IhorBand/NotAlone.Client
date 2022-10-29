import './Message.css';

import { MessageModel } from '../../models/MessageModel';

const MessageComponent = (props: MessageModel) => {
    return (
        <div className='message-item'>
            <div className='user-avatar-wrapper'>
                {props.userName==='Rom4ik' ? <img className='user-avatar' src="https://static8.tgstat.ru/channels/_0/90/908e7729970bbb8837e0f4e5e83b15da.jpg" /> : 
                props.userName==='s1lence' ? <img className='user-avatar' src="https://wallpapercave.com/dwp1x/wp5412170.jpg" /> :
                props.userName==='Andrew' ? <img className='user-avatar' src="https://cdn.anime-pictures.net/previews/223/223655425628fd7d2b9c9778de6cb60b_bp.jpg.avif" /> :
                props.userName==='Ihor' ? <img className='user-avatar' src="https://cdn.anime-pictures.net/previews/614/61426a1f973f122a560656c7253e391e_bp.jpg" /> : 
                <img className='user-avatar' src="https://cdn.anime-pictures.net/previews/f2e/f2e2165588a53da9c62a8984308c8484_sp.gif.webp" />}
            </div>
            <div className='user-info'>
                <div className='user-name'>{props.userName}</div>
                <div className='user-message'>{props.message}</div>
            </div>
        </div>
    )
};

export default MessageComponent;
