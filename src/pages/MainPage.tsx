import './MainPage.css';

import { useState, useEffect, useRef } from 'react';
import ReactHlsPlayer from "react-hls-player";
import Chat from '../components/Chat/Chat';
import { getTokenFromStorage, isMaster, isMaster as isRomchik } from '../api/TokenStorageService';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, BASE_VIDEO_HUB_URL, SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO, 
    SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, 
    SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, 
    SIGNALR_VIDEO_HUB_SEND_START_VIDEO, SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, 
    SIGNALR_VIDEO_HUB_SEND_VIDEO, SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP } from '../config';
import { VideoModel } from '../models/Video/VideoModel';
import { VideoQualityModel } from '../models/Video/VideoQualityModel';
import { VideoTimeStampModel } from '../models/Video/VideoTimeStampModel';
import { getAllVideos, getQualitiesByVideoId } from '../api/VideoService';

const MainPageComponent = () => {
    const [ hlsUrl, setHlsUrl ] = useState<string>("https://stream.voidboost.cc/97bf54d7b84d90cf55207dfcdf6f3dd7:2022102512:d952760f-c287-49d2-994d-41d7521ed04a/2/2/6/2/6/8/2q342.mp4:hls:manifest.m3u8");
    const [ videos, setVideos ] = useState<VideoModel[]>([]);
    const [ qualities, setQualities ] = useState<VideoQualityModel[]>([]); 
    const [ updateTimeIntervalId, setUpdateTimeIntervalId ] = useState<NodeJS.Timer>();
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ accessToken, setAccessToken ] = useState<string>("");
    const [ currentVideoId, setCurrentVideoId ] = useState<string>("00000000-0000-0000-0000-000000000000");
    const [ mastersCurrentTimeStamp, setMastersCurrentTimeStamp ] = useState<number>(0);
    const [ isFullscreen, setIsFullscreen ] = useState<boolean>(false);
    const [ isHls, setIsHls ] = useState<boolean>(false);
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

        getAllVideos().then((response) => {
            let videoModels = response.data as VideoModel[];
            console.log(videoModels);
            setVideos(videoModels);
            videoModels.map((video, i) => {
                getQualitiesByVideoId(video.id).then((innerResponse) => {
                    let videoQualitiesModels = innerResponse.data as VideoQualityModel[];
                    console.log(videoQualitiesModels)
                    setQualities([...qualities, ...videoQualitiesModels]);
                });
            });
        });
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
                        setHlsUrl('');//TODO:videoURL
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

    const onFullscreenClick = () => {
        if(isFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
        } else {
            setIsFullscreen(true);
            document.body.requestFullscreen();
        }
    }

    const onVideoQualityClick = (qualityId: string) => {
        console.log(qualityId);
    }

    const isHlsHdRezkaOnChange = () => {
        if(isHlsHdRezka && isHlsHdRezka.current) {
            setIsHls(isHlsHdRezka.current.checked);
        }
    }

    return (
        <>
            <div className={ (isFullscreen ? "fullscreen" : "") + " main-interface"}>
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
            <div>
                <button className="js-toggle-fullscreen-btn toggle-fullscreen-btn" aria-label="Enter fullscreen mode" onClick={onFullscreenClick}>
                        <svg className="toggle-fullscreen-svg" width="28" height="28" viewBox="-2 -2 28 28">
                            <g className="icon-fullscreen-enter">
                                <path d="M 2 9 v -7 h 7" />
                                <path d="M 22 9 v -7 h -7" />
                                <path d="M 22 15 v 7 h -7" />
                                <path d="M 2 15 v 7 h 7" />
                            </g>
                            
                            <g className="icon-fullscreen-leave">
                                <path d="M 24 17 h -7 v 7" />
                                <path d="M 0 17 h 7 v 7" />
                                <path d="M 0 7 h 7 v -7" />
                                <path d="M 24 7 h -7 v -7" />
                            </g>
                        </svg>
                    </button>   
            </div>

            { isMaster() ?
            <div className={(isFullscreen ? 'hidden' : '') + ' master-controls-wrapper'}>
                <label htmlFor="mainVideoUrl">Main Video Url { isHls ? "HLS(m3u8)" : "MP4" }:</label>
                <input 
                    type="text"
                    id="mainVideoUrl"
                    name="mainVideoUrl"
                    ref={mainVideoUrl} />

                <label htmlFor="mainVideoName">Main Video Name:</label>
                <input 
                    type="text"
                    id="mainVideoName"
                    name="mainVideoName"
                    ref={mainVideoName} />

                <label htmlFor="isHlsHdRezka">Is Hls HdRezka:</label>
                <input
                    type="checkbox"
                    id="isHlsHdRezka"
                    name="isHlsHdRezka"
                    ref={isHlsHdRezka}
                    onChange={isHlsHdRezkaOnChange}
                    />

                <button onClick={onChangeMainVideo}>Submit</button>
            </div>
            :
            ""
            }

            <div className='video-playlist'>
            { videos.map((video, i) => {                 
                return (
                <div key={video.id} className='video-playlist-item'>
                    <div className='video-name'>{video.name}</div>
                        <div className='video-quality-list'>
                        { qualities.map((quality, i) => {
                        if(quality.videoId == video.id) return (    
                            <div key={quality.id} className='video-quality-item' onClick={(e) => onVideoQualityClick(quality.id) }>
                                <div className='video-quality-name'>{quality.name}</div>
                            </div>
                        )})}
                    </div>
                </div>
                )})}
            </div>
        </>
    )
};

export default MainPageComponent;
