import './Chat.css';

import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionState, HubConnectionBuilder } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, SIGNALR_CHAT_HUB_SEND_MESSAGE, SIGNALR_CHAT_HUB_RECEIVE_MESSAGE } from "../../api/SignalREndpoints";
import { MessageModel } from '../../models/MessageModel';
import ChatInput from './ChatInput';
import ChatWindow from './ChatWindow';
import { getTokenFromStorage } from '../../api/TokenStorageService';
import { Message } from 'react-hook-form';
import MessageReceivedSound from "../../audioclips/message_received.mp3";
import { Howl, Howler } from 'howler';
import { Slider, Stack } from '@mui/material';

const Chat = () => {
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ chatMessages, setChatMessages ] = useState<MessageModel[]>([]);
    const [ accessToken, setAccessToken ] = useState<string>("");
    const [ volume, setVolume ] = useState<number>(100);
    // new data
    const [ receivedMessage, setReceivedMessage ] = useState<MessageModel>();

    const messageListDiv = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        var tokenModel = getTokenFromStorage();
        if(tokenModel && tokenModel.token && tokenModel.token !== "") {
            setAccessToken(tokenModel.token);
        }
    }, []);

    useEffect(() => {
        if(accessToken && accessToken !== "") {
            ConnectToHub();
        }
    }, [accessToken]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected to Chat Hub!');
                    connection.on(SIGNALR_CHAT_HUB_RECEIVE_MESSAGE, message => {
                        setReceivedMessage(message as MessageModel);
                    });
                })
                .catch(e => {
                    console.log('Connection failed: ', e);
                    console.log(e); 
                });
        }
    }, [connection]);

    // new data received
    useEffect(() => {
        let tokenModel = getTokenFromStorage();
        if(receivedMessage && receivedMessage.message !== "" && tokenModel) {
            if(chatMessages.length > 0 && chatMessages[chatMessages.length - 1]) {
                receivedMessage.id = chatMessages[chatMessages.length - 1].id + 1;
            } else {
                receivedMessage.id = 1;
            }

            if(chatMessages.length > 150) {
                chatMessages.splice(0, 100);
            }
            setChatMessages([...chatMessages, receivedMessage]);
            if(receivedMessage.userId != tokenModel.userId) {
                const sound = new Howl({ src: MessageReceivedSound });
                sound.volume(volume/100);
                sound.play();
            }

            if(messageListDiv && messageListDiv.current) {
                messageListDiv.current.scrollTop = messageListDiv.current.scrollHeight;
            }
        }
    }, [receivedMessage]);

    const onSendMessage = async (message: string) => {
        if (connection && connection.state === HubConnectionState.Connected) {
            try {
                await connection.send(SIGNALR_CHAT_HUB_SEND_MESSAGE, message);
            }
            catch(e) {
                console.log(e);
            }
        }
        else {
            alert('No connection to server yet.');
        }
    }

    const ConnectToHub = () => {
        const newConnection = new HubConnectionBuilder()
        .withUrl(BASE_CHAT_HUB_URL, {
            accessTokenFactory: () => { return accessToken; },
            withCredentials: false
        } as signalR.IHttpConnectionOptions)
        .withAutomaticReconnect()
        .build();

        newConnection.onclose((error) => {
            console.log(error?.message);
            console.log(error);
        })

        setConnection(newConnection);
    }

    const handleVolumeChange = (event: Event, value: number | number[], activeThumb: number) => {
        let a = value as number;
        setVolume(a);
    }

    return (
        <>
            <div className='chat-interface'>
                <div>
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
                <ChatWindow chatMessages={chatMessages} messageListDiv={messageListDiv} />
            </div>
        </>
    );
};
export default Chat;