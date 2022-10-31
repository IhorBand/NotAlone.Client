import './ChatWindow.css';
import MessageReceivedSound from "../../audioclips/message_received.mp3";

import { MessageModel } from '../../models/MessageModel';

import Message from './Message';
import { useEffect, useRef, useState } from 'react';
import { RefObject } from 'react';
import { Howl } from 'howler';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, SIGNALR_CHAT_HUB_RECEIVE_MESSAGE, SIGNALR_CHAT_HUB_SEND_MESSAGE } from '../../api/SignalREndpoints';
import { getTokenFromStorage } from '../../api/TokenStorageService';

export interface ChatWindowComponentProps {
    newMessageReceivedSoundVolume: number;
    isFullscreen: boolean;
    newMessageToSend: MessageModel;
}

const ChatWindowComponent = (props : ChatWindowComponentProps) => {
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ chatMessages, setChatMessages ] = useState<MessageModel[]>([]);
    const [ accessToken, setAccessToken ] = useState<string>("");
    const messageListDiv = useRef<HTMLDivElement>(null);
    // new data
    const [ receivedMessage, setReceivedMessage ] = useState<MessageModel>();

    useEffect(() => {
        if(props.newMessageToSend && props.newMessageToSend.message && props.newMessageToSend.message.trim() != '') {
            if (connection && connection.state === HubConnectionState.Connected) {
                try {
                    connection.send(SIGNALR_CHAT_HUB_SEND_MESSAGE, props.newMessageToSend.message);
                }
                catch(e) {
                    console.log(e);
                }
            }
            else {
                alert('No connection to server yet.');
            }
        }
    }, [props.newMessageToSend]);

    useEffect(() => {
        var tokenModel = getTokenFromStorage();
        if(tokenModel && tokenModel.token && tokenModel.token !== "") {
            setAccessToken(tokenModel.token);
        }
    }, []);

    useEffect(() => {
        if(accessToken && accessToken.trim() !== "" && (connection ? connection.state != HubConnectionState.Connected : true)) {
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
                chatMessages.splice(0, 125);
            }
            setChatMessages([...chatMessages, receivedMessage]);
            if(receivedMessage.userId != tokenModel.userId) {
                const sound = new Howl({ src: MessageReceivedSound });
                sound.volume(props.newMessageReceivedSoundVolume/100);
                sound.play();
            }
        }
    }, [receivedMessage]);

    useEffect(() => {
        if(messageListDiv && messageListDiv.current) {
            messageListDiv.current.scrollTop = messageListDiv.current.scrollHeight;
        }
    }, [chatMessages]);

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
    
    return(
        <div ref={messageListDiv} className='message-list'>
        { chatMessages.map((m, i) => { return (
            <Message 
            key={m.id}
            isFullscreen={props.isFullscreen}
            message={m} />
        );})}
        </div>
    )
};

export default ChatWindowComponent;