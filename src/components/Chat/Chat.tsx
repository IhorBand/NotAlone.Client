import './Chat.css';

import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionState, HubConnectionBuilder } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, SIGNALR_CHAT_HUB_SEND_MESSAGE, SIGNALR_CHAT_HUB_RECEIVE_MESSAGE } from "../../api/SignalREndpoints";
import { MessageModel } from '../../models/MessageModel';
import ChatInput from './ChatInput';
import ChatWindow from './ChatWindow';
import { getTokenFromStorage } from '../../api/TokenStorageService';
import { Message } from 'react-hook-form';
import { Howl, Howler } from 'howler';
import { Slider, Stack } from '@mui/material';

export interface ChatComponentProps {
    isFullscreen: boolean;
    onNewMessageReceived: () => void;
}


const ChatComponent = (props : ChatComponentProps) => {    
    const [ volume, setVolume ] = useState<number>(100);
    const [ messageToSend, setMessageToSend ] = useState<MessageModel>();

    const onSendMessage = async (message: string) => {
        let messageModel = new MessageModel();
        messageModel.message = message;

        setMessageToSend(messageModel);
    }

    const handleVolumeChange = (event: Event, value: number | number[], activeThumb: number) => {
        let a = value as number;
        setVolume(a);
    }

    const onNewMessageReceived = () => {
        props.onNewMessageReceived();
    }

    return (
        <>
            <div className='chat-interface'>
                <div className="volume-selector">
                    <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                        <div className="volume-up-img">
                            <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="VolumeDownIcon"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
                        </div>
                        <Slider aria-label="Volume" value={volume} onChange={handleVolumeChange} />
                        <div className="volume-down-img">
                            <svg className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="VolumeUpIcon"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
                        </div>
                    </Stack>
                </div>
                <hr />
                <ChatInput onSendMessage={onSendMessage} />
                <hr />
                <ChatWindow newMessageReceivedSoundVolume={volume}
                    isFullscreen={props.isFullscreen}
                    newMessageToSend={messageToSend ? messageToSend : new MessageModel()} 
                    onNewMessageReceived={onNewMessageReceived} />
            </div>
        </>
    );
};
export default ChatComponent;