import './Chat.css';

import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionState, HubConnectionBuilder } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, SIGNALR_CHAT_HUB_SEND_MESSAGE, SIGNALR_CHAT_HUB_RECEIVE_MESSAGE } from "../../config";
import { MessageModel } from '../../models/MessageModel';
import ChatInput from './ChatInput';
import ChatWindow from './ChatWindow';
import { getTokenFromStorage } from '../../api/TokenStorageService';

const Chat = () => {
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ chatMessages, setChatMessages ] = useState<MessageModel[]>([]);
    const [ accessToken, setAccessToken ] = useState<string>("");
    
    const latestChatMessages = useRef<MessageModel[]>([]);
    latestChatMessages.current = chatMessages;
    
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
                        receiveMessage(message as MessageModel)
                    });
                })
                .catch(e => {
                    console.log('Connection failed: ', e);
                    console.log(e); 
                });
        }
    }, [connection]);

    const receiveMessage = (model: MessageModel) => {
        const updatedChat = [...latestChatMessages.current];
        updatedChat.push(model);
        setChatMessages(updatedChat);
    }

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

    return (
        <>
            <div className='chat-interface'>
                <ChatInput onSendMessage={onSendMessage} />
                <hr />
                <ChatWindow chatMessages={chatMessages}/>
            </div>
        </>
    );
};
export default Chat;