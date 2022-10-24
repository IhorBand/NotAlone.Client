import './MainPage.css';

import { useState, useEffect, useRef } from 'react';
import ReactHlsPlayer from "react-hls-player";
import Chat from '../components/Chat/Chat';
import { getTokenFromStorage, isMaster } from '../api/TokenStorageService';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, BASE_VIDEO_HUB_URL, SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, SIGNALR_VIDEO_HUB_SEND_START_VIDEO, SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP } from '../config';
import { VideoModel } from '../models/Video/VideoModel';
import { VideoQualityModel } from '../models/Video/VideoQualityModel';
import { VideoTimeStampModel } from '../models/Video/VideoTimeStampModel';

const MainPageComponent = () => {
    const [ hlsUrl, setHlsUrl ] = useState<string>("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
    const [ updateTimeIntervalId, setUpdateTimeIntervalId ] = useState<NodeJS.Timer>();
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ accessToken, setAccessToken ] = useState<string>("");
    const [ currentVideoId, setCurrentVideoId ] = useState<string>("00000000-0000-0000-0000-000000000000");
    const playerRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        var tokenModel = getTokenFromStorage();
        if(tokenModel && tokenModel.token && tokenModel.token !== "") {
            setAccessToken(tokenModel.token);
        }
    }, []);

    useEffect(() => {
        if(accessToken && accessToken !== "") {
            console.log(accessToken);
            ConnectToHub();
        }
    }, [accessToken]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected to video Hub!');
                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO, message => {
                        console.log("New Video!");
                        console.log(message);
                        console.log(message as VideoModel);
                        // need to add element to array for both(master and slaves) and update component !!!!!
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, message => {
                        console.log("New Video Quality!");
                        console.log(message);
                        console.log(message as VideoQualityModel);
                        // need to add element to array for both(master and slaves) and update component !!!!!
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, message => {
                        console.log("New Time!");
                        console.log(message);
                        console.log(message as VideoTimeStampModel);
                        if(!isMaster()) {
                            //check if current time is <> 5 seconds than master's current time, if so -> update to master's time
                        }
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, message => {
                        console.log("Play!");
                        console.log(message);
                        console.log(message as VideoTimeStampModel);
                        if(!isMaster()) {
                            playVideo();
                        }
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, () => {
                        console.log("Pause!");
                        if(!isMaster()) {
                            pauseVideo();
                        }
                    });
                })
                .catch(e => {
                    console.log('Connection failed: ', e);
                    console.log(e); 
                });
        }
    }, [connection]);

    const ConnectToHub = () => {
        const newConnection = new HubConnectionBuilder()
        .withUrl(BASE_VIDEO_HUB_URL, {
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

    const updateVideoTimeForClients = () => {
        console.log(playerRef.current);
        if(playerRef.current && connection) {
            console.log(playerRef.current.currentTime);
            connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP, currentVideoId, playerRef.current.currentTime.toString());
        } 
    }

    const playVideo = () => {
        if(playerRef && playerRef.current)
        {
            console.log(playerRef.current.currentTime);
            if(connection && isMaster()) {
                let videoId = currentVideoId;
                let timestamp = playerRef.current.currentTime.toString();
                connection.send(SIGNALR_VIDEO_HUB_SEND_START_VIDEO, videoId, timestamp);
                const myInterval = setInterval(() => {
                    updateVideoTimeForClients();
                }, 5000);

                setUpdateTimeIntervalId(myInterval);
            }
            
            playerRef.current.play();
        }
    }

    const pauseVideo = () => {
        if(playerRef && playerRef.current)
        {
            if(connection && isMaster()) {
                let videoId = currentVideoId;
                let timestamp = playerRef.current.currentTime.toString();
                connection.send(SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, videoId, timestamp);
                clearInterval(updateTimeIntervalId);
            }

            playerRef.current.pause();
        }
    }

    const toggleControls = () => {
        if(playerRef && playerRef.current)
        {
            playerRef.current.controls = !playerRef.current.controls;
        }
    }

    const click = () => {
        if(playerRef.current) {
            playerRef.current.currentTime = 5;
        }
    }

    return (
        <>
            <div className='main-interface'>
                <div className='video-player-wrapper'>
                    {/* <video className="video-player" controls>
                        <source src="https://stream.voidboost.cc/f4dd580e3c769aafd5a347f3886ce9e9:2022101922:bWlzWHhycWVkaXpJRnkyMjV1ck45WnpLT3dYNXpSdld1YmVZcjAvUFZKbXUyMVpGV05RODFka2pqL0RTUFQ4UnhUQUM2K0FEVXhlUE1mV1RPQ3VzaGc9PQ==/6/7/3/8/5/2/d9d2z.mp4:hls:manifest.m3u8" type="application/x-mpegURL" />
                    </video> */}
                    <ReactHlsPlayer
                        playerRef={playerRef}
                        src={hlsUrl}
                        controls={true}
                        className="react-player"
                        onPlay={playVideo}
                        onPause={pauseVideo}
                    />
                </div>
                <div className='chat-wrapper'>
                    <Chat />
                </div>
            </div>
        </>
    )
};

export default MainPageComponent;
