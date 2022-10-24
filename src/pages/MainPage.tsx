import './MainPage.css';

import { useState, useEffect, useRef } from 'react';
import ReactHlsPlayer from "react-hls-player";
import Chat from '../components/Chat/Chat';
import { getTokenFromStorage, isMaster, isMaster as isRomchik } from '../api/TokenStorageService';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, BASE_VIDEO_HUB_URL, SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, SIGNALR_VIDEO_HUB_SEND_START_VIDEO, SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, SIGNALR_VIDEO_HUB_SEND_VIDEO, SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP } from '../config';
import { VideoModel } from '../models/Video/VideoModel';
import { VideoQualityModel } from '../models/Video/VideoQualityModel';
import { VideoTimeStampModel } from '../models/Video/VideoTimeStampModel';

const MainPageComponent = () => {
    //https://stream.voidboost.cc/5d22d33a5c1709150230ad2ad4c49359:2022102512:f4556a98-f257-468b-a693-f8aceb207d1f/6/8/1/1/6/4/orwbk.mp4:hls:manifest.m3u8
    const [ hlsUrl, setHlsUrl ] = useState<string>("https://stream.voidboost.cc/97bf54d7b84d90cf55207dfcdf6f3dd7:2022102512:d952760f-c287-49d2-994d-41d7521ed04a/2/2/6/2/6/8/2q342.mp4:hls:manifest.m3u8");
    const [ updateTimeIntervalId, setUpdateTimeIntervalId ] = useState<NodeJS.Timer>();
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ accessToken, setAccessToken ] = useState<string>("");
    const [ currentVideoId, setCurrentVideoId ] = useState<string>("00000000-0000-0000-0000-000000000000");
    const [ mastersCurrentTimeStamp, setMastersCurrentTimeStamp ] = useState<number>(0);
    const playerRef = useRef<HTMLVideoElement>(null);
    const mainVideoUrl = useRef<HTMLInputElement>(null);
    const mainVideoName = useRef<HTMLInputElement>(null);
    const isHlsHdRezka = useRef<HTMLInputElement>(null);

    const updateUsersTimeStampIntervalSec = 4;
    const updateUsersTimeStampIntervalMs = updateUsersTimeStampIntervalSec*1000;
    
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
                        let model = message as VideoModel;
                        setHlsUrl(model.url);
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
                        if(!isRomchik()) {
                            let model = message as VideoTimeStampModel;
                            if(model.timeStamp) {
                                let mastersTimeStamp = Number(model.timeStamp);
                                setMastersCurrentTimeStamp(mastersTimeStamp);
                                if(playerRef && playerRef.current 
                                    && (((mastersTimeStamp - playerRef.current.currentTime >= (updateUsersTimeStampIntervalSec/1000)) || (mastersTimeStamp - playerRef.current.currentTime <= -1 * (updateUsersTimeStampIntervalSec/1000)))
                                        || model.isForce)) {
                                    playerRef.current.currentTime = mastersTimeStamp;
                                }
                            }
                        }
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, message => {
                        console.log("Play!");
                        console.log(message);
                        console.log(message as VideoTimeStampModel);
                        playVideo(false);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, (message) => {
                        console.log("Pause!");
                        console.log(message as VideoTimeStampModel);
                        if(!isRomchik()) {
                            if (playerRef && playerRef.current) {
                                let model = message as VideoTimeStampModel;
                                console.log("set new time: " + model.timeStamp);
                                playerRef.current.currentTime = Number(model.timeStamp);
                            }
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
            connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP, currentVideoId, playerRef.current.currentTime.toString(), false);
        } 
    }

    const playVideo = async (isNeedToUpdateTimeStamp: boolean = true) => {
        if(playerRef && playerRef.current)
        {
            if(isNeedToUpdateTimeStamp && !isRomchik()) {
                playerRef.current.currentTime = mastersCurrentTimeStamp; 
                console.log(playerRef.current.currentTime);
            }
            
            playerRef.current.play();
        }
    }

    const onPlayVideo = () => {
        if(playerRef && playerRef.current)
        {
            if(connection && isRomchik()) {
                let videoId = currentVideoId;
                let timestamp = playerRef.current.currentTime.toString();
                connection.send(SIGNALR_VIDEO_HUB_SEND_START_VIDEO, videoId, timestamp);
                const myInterval = setInterval(() => {
                    updateVideoTimeForClients();
                }, updateUsersTimeStampIntervalMs);

                setUpdateTimeIntervalId(myInterval);
            }
        }
    }

    const pauseVideo = () => {
        if(playerRef && playerRef.current)
        {
            playerRef.current.pause();
            if(connection && isRomchik()) {
                let videoId = currentVideoId;
                let timestamp = playerRef.current.currentTime.toString();
                clearInterval(updateTimeIntervalId);
                connection.send(SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, videoId, timestamp);
            }
        }
    }

    const onPauseVideo = () => {
        pauseVideo();
    }

    const onSeeked = () => {
        if(connection && isRomchik()) {
            if(playerRef && playerRef.current) {
                let videoId = currentVideoId;
                let timestamp = playerRef.current.currentTime.toString();
                connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP, videoId, timestamp, true);
            }
        }
    }

    const onChangeMainVideo = () => {
        if(connection && connection.state == HubConnectionState.Connected 
            && mainVideoUrl && mainVideoUrl.current && mainVideoUrl.current.value
            && mainVideoName && mainVideoName.current && mainVideoName.current.value
            && isHlsHdRezka && isHlsHdRezka.current
            && isRomchik()) {
            let URL = mainVideoUrl.current.value;
            let name = mainVideoName.current.value;
            if (isHlsHdRezka.current.checked) {
                URL += ":hls:manifest.m3u8";
            }
            connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO, URL, name);
        }
    }

    return (
        <>
            <div className='main-interface'>
                <div className='video-player-wrapper'>
                    <ReactHlsPlayer
                        playerRef={playerRef}
                        src={hlsUrl}
                        controls={true}
                        className="react-player"
                        onPlay={onPlayVideo}
                        onPause={onPauseVideo}
                        onSeeked={onSeeked}
                    >
                    </ReactHlsPlayer>
                </div>
                <div className='chat-wrapper'>
                    <Chat />
                </div>
            </div>

            { isMaster() ?
            <div>
                <label htmlFor="mainVideoUrl">Main Video Url { isHlsHdRezka && isHlsHdRezka.current && isHlsHdRezka.current.checked ? "HLS(m3u8)" : "MP4" }:</label>
                <input 
                    type="text"
                    id="mainVideoUrl"
                    name="mainVideoUrl"
                    ref={mainVideoUrl} />
                <br />
                <br />

                <label htmlFor="mainVideoName">Main Video Name:</label>
                <input 
                    type="text"
                    id="mainVideoName"
                    name="mainVideoName"
                    ref={mainVideoName} />
                <br />
                <br />

                <label htmlFor="isHlsHdRezka">Is Hls HdRezka:</label>
                <input
                    type="checkbox"
                    id="isHlsHdRezka"
                    name="isHlsHdRezka"
                    ref={isHlsHdRezka}
                    />
                <br />

                <button onClick={onChangeMainVideo}>Submit</button>
            </div>
            :
            ""
            }
        </>
    )
};

export default MainPageComponent;
