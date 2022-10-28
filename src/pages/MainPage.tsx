import './MainPage.css';

import React, { useState, useEffect, useRef, SyntheticEvent } from 'react';
import ReactHlsPlayer from "react-hls-player";
import Chat from '../components/Chat/Chat';
import { getTokenFromStorage, isMaster, isMaster as isRomchik } from '../api/TokenStorageService';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BASE_CHAT_HUB_URL, BASE_VIDEO_HUB_URL, HD_REZKA_M3U8_PREFIX, SIGNALR_VIDEO_HUB_RECEIVE_CHANGE_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO, 
    SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, 
    SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, 
    SIGNALR_VIDEO_HUB_SEND_CHANGE_VIDEO, 
    SIGNALR_VIDEO_HUB_SEND_START_VIDEO, SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, 
    SIGNALR_VIDEO_HUB_SEND_VIDEO, SIGNALR_VIDEO_HUB_SEND_VIDEO_QUALITY, SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP } from '../config';
import { VideoModel } from '../models/Video/VideoModel';
import { VideoQualityModel } from '../models/Video/VideoQualityModel';
import { VideoTimeStampModel } from '../models/Video/VideoTimeStampModel';
import { getAllQualities, getAllVideos, getQualitiesByVideoId } from '../api/VideoService';
import { ChangeQualityModel } from '../models/ChangeQualityModel';

const MainPageComponent = () => {
    const [ videos, setVideos ] = useState<VideoModel[]>([]);
    const [ qualities, setQualities ] = useState<VideoQualityModel[]>([]); 
    const [ updateTimeIntervalId, setUpdateTimeIntervalId ] = useState<NodeJS.Timer>();
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ accessToken, setAccessToken ] = useState<string>("");
    const [ currentVideoId, setCurrentVideoId ] = useState<string>("00000000-0000-0000-0000-000000000000");
    const [ currentVideoQualityId, setCurrentVideoQualityId ] = useState<string>("00000000-0000-0000-0000-000000000000");
    const [ mastersCurrentTimeStamp, setMastersCurrentTimeStamp ] = useState<number>(0);
    const [ isFullscreen, setIsFullscreen ] = useState<boolean>(false);
    const [ currentVideoUrl, setCurrentVideoUrl ] = useState<ChangeQualityModel>(new ChangeQualityModel);
    const playerRef = useRef<HTMLVideoElement>(null);

    const videoNameTxt = useRef<HTMLInputElement>(null);

    const addVideoQualitySelectVideoDDL = useRef<HTMLSelectElement>(null);
    const videoQualityNameTxt = useRef<HTMLInputElement>(null);
    const videoQualityUrlTxt = useRef<HTMLInputElement>(null);
    const isHlsHdRezka = useRef<HTMLInputElement>(null);


    // new data received
    const [ onReceiveNewVideoData, setOnReceiveNewVideoData ] = useState<VideoModel>();
    const [ onReceiveNewVideoQualityData, setOnReceiveNewVideoQualityData ] = useState<VideoQualityModel>();
    const [ onReceiveNewTimeStampData, setOnReceiveNewTimeStampData ] = useState<VideoTimeStampModel>();
    const [ onReceiveChangeVideoData, setOnReceiveChangeVideoData ] = useState<VideoTimeStampModel>();
    const [ onReceiveStartVideoData, setOnReceiveStartVideoData ] = useState<VideoTimeStampModel>();
    const [ onReceiveStopVideoData, setOnReceiveStopVideoData ] = useState<VideoTimeStampModel>();

    useEffect(() => {
        if(onReceiveNewVideoData) {
            onReceiveNewVideo(onReceiveNewVideoData);
        }
    }, [onReceiveNewVideoData]);

    useEffect(() => {
        if(onReceiveNewVideoQualityData) {
            onReceiveNewVideoQuality(onReceiveNewVideoQualityData);
        }
    }, [onReceiveNewVideoQualityData]);

    useEffect(() => {
        if(onReceiveNewTimeStampData) {
            onReceiveNewTimeStamp(onReceiveNewTimeStampData);
        }
    }, [onReceiveNewTimeStampData]);

    useEffect(() => {
        if(onReceiveChangeVideoData) {
            onReceiveChangeVideo(onReceiveChangeVideoData);
        }
    }, [onReceiveChangeVideoData]);

    useEffect(() => {
        if(onReceiveStartVideoData) {
            onReceiveStartVideo(onReceiveStartVideoData);
        }
    }, [onReceiveStartVideoData]);

    useEffect(() => {
        if(onReceiveStopVideoData) {
            onReceiveStopVideo(onReceiveStopVideoData);
        }
    }, [onReceiveStopVideoData]);

    //end new data received

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
        });

        getAllQualities().then((response) => {
            let videoQualitiesModels = response.data as VideoQualityModel[];
            console.log(videoQualitiesModels)
            setQualities(videoQualitiesModels);
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
                        let model = message as VideoModel;
                        console.log(model);
                        setOnReceiveNewVideoData(model)
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, message => {
                        console.log("New Video Quality!");
                        console.log(message);
                        let model = message as VideoQualityModel;
                        console.log(model);
                        setOnReceiveNewVideoQualityData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_CHANGE_VIDEO, message => {
                        console.log("New Time!");
                        console.log(message);
                        let model = message as VideoTimeStampModel;
                        console.log(model);
                        setOnReceiveChangeVideoData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, message => {
                        console.log("New Time!");
                        console.log(message);
                        let model = message as VideoTimeStampModel;
                        console.log(model);
                        setOnReceiveNewTimeStampData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, (message) => {
                        console.log("Play!");
                        console.log(message);
                        console.log(qualities);
                        let model = message as VideoTimeStampModel;
                        setOnReceiveStartVideoData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, (message) => {
                        console.log("Pause!");
                        let model = message as VideoTimeStampModel;
                        console.log(model);
                        setOnReceiveStopVideoData(model);
                    });
                })
                .catch(e => {
                    console.log('Connection failed: ', e);
                    console.log(e); 
                });
        }
    }, [connection]);
    
    //Receive

    const onReceiveNewVideo = (model: VideoModel) => {
        setVideos(vs => [...vs, model]);
    }

    const onReceiveNewVideoQuality = (model: VideoQualityModel) => {
        setQualities(qs => [...qs, model]);
    }

    const checkIfUserIsNotSynchronized = (mastersTimeStamp: number) : boolean => {
        if(playerRef && playerRef.current) {
            return (mastersTimeStamp - playerRef.current.currentTime >= updateUsersTimeStampIntervalSec) 
                            || (mastersTimeStamp - playerRef.current.currentTime <= -1 * updateUsersTimeStampIntervalSec);
        }
        return true;
    }

    const onReceiveNewTimeStamp = (model: VideoTimeStampModel) => {
        if(!isRomchik()) {
            if(model.timeStamp) {
                let mastersTimeStamp = Number(model.timeStamp);
                setMastersCurrentTimeStamp(mastersTimeStamp);
                if(playerRef && playerRef.current && (checkIfUserIsNotSynchronized(mastersTimeStamp) || model.isForce)) {
                    console.log("Woooow, you're so slow, need update.")
                    playerRef.current.currentTime = mastersTimeStamp;
                }
            }
        }
    }

    const onReceiveChangeVideo = (model: VideoTimeStampModel) => {
        let minQuality = new VideoQualityModel();
        minQuality.id = "00000000-0000-0000-0000-000000000000";
        minQuality.name = "0";
        for(let i=0; i < qualities.length; i++) {
            if(qualities[i].videoId == model.videoId) {
                let minQualityNum = Number(minQuality.name);
                let curQualityNum = Number(qualities[i].name);
                if(!isNaN(minQualityNum) && !isNaN(curQualityNum)){
                    if(minQualityNum < curQualityNum){
                        minQuality = qualities[i];
                    }
                } else {
                    minQuality = qualities[i];
                }
            }
        }
        setCurrentVideoId(model.videoId);
        setCurrentVideoQualityId(q => minQuality.id);
        let changeQualitymodel = new ChangeQualityModel();
        changeQualitymodel.videoUrl = minQuality.url;
        changeQualitymodel.videoTimeStamp = 0;
        setCurrentVideoUrl(changeQualitymodel);
    }

    const onReceiveStartVideo = (model: VideoTimeStampModel) => {
        if(playerRef && playerRef.current) {
            if(!isRomchik()) {
                playerRef.current.currentTime = Number(model.timeStamp); 
                console.log(playerRef.current.currentTime);
            }

            playerRef.current.play();
        }
    }

    const onReceiveStopVideo = (model: VideoTimeStampModel) => {
        if(!isRomchik()) {
            if (playerRef && playerRef.current) {
                console.log("set new time: " + model.timeStamp);
                playerRef.current.currentTime = Number(model.timeStamp);
                playerRef.current.pause();
            }
        }
    }

    //end Receive

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
        if(playerRef.current && connection && connection.state == HubConnectionState.Connected) {
            console.log(playerRef.current.currentTime);
            connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP, currentVideoId, playerRef.current.currentTime.toString(), false);
        } 
    }

    const onPlayVideo = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        e.preventDefault();
        if(playerRef && playerRef.current) {
            if(connection && connection.state == HubConnectionState.Connected && isRomchik()) {
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

    const onPauseVideo = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        e.preventDefault();
        if(playerRef && playerRef.current) {
            if(connection && connection.state == HubConnectionState.Connected && playerRef && playerRef.current && isRomchik()) {
                let videoId = currentVideoId;
                let timestamp = playerRef.current.currentTime.toString();
                clearInterval(updateTimeIntervalId);
                connection.send(SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, videoId, timestamp);
            }
        }
    }

    const onSeeked = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if(connection && connection.state == HubConnectionState.Connected && isRomchik()) {
            if(playerRef && playerRef.current) {
                let videoId = currentVideoId;
                let timestamp = playerRef.current.currentTime.toString();
                connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP, videoId, timestamp, true);
            }
        } else if(!isRomchik()) {
            e.preventDefault();
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

    const onAddVideoClick = () => {
        if(isRomchik() && connection && connection.state == HubConnectionState.Connected
            && videoNameTxt && videoNameTxt.current && videoNameTxt.current.value) {
            connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO, videoNameTxt.current.value);
        }
    }

    const onAddVideoQualityClick = () => {
        if(isRomchik() && connection && connection.state == HubConnectionState.Connected
        && videoQualityNameTxt && videoQualityNameTxt.current && videoQualityNameTxt.current.value
        && videoQualityUrlTxt && videoQualityUrlTxt.current && videoQualityUrlTxt.current.value
        && addVideoQualitySelectVideoDDL && addVideoQualitySelectVideoDDL.current && addVideoQualitySelectVideoDDL.current.value
        && isHlsHdRezka && isHlsHdRezka.current) {
            let checkQualityName = Number(videoQualityNameTxt.current.value);
            if(!isNaN(checkQualityName)) {
                let url = videoQualityUrlTxt.current.value;
                if (isHlsHdRezka.current.checked) {
                    url += HD_REZKA_M3U8_PREFIX;
                }
                connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO_QUALITY, addVideoQualitySelectVideoDDL.current.value, url, videoQualityNameTxt.current.value);
            } else {
                alert("Quality Name must be a number(1234567890)");
            }
        }
    }

    const onVideoQualityClick = (quality: VideoQualityModel) => {
        if(playerRef && playerRef.current) {
            //if Roma -> send selected video to all other persons and to Roma to play video
            if(isRomchik() && connection && connection.state == HubConnectionState.Connected && quality) {
                let isNewVideo = quality.videoId != currentVideoId;
                let changeQualityModel = new ChangeQualityModel();
                changeQualityModel.videoTimeStamp = playerRef.current.currentTime;
                changeQualityModel.videoUrl = quality.url;
                playerRef.current.pause();
                setCurrentVideoUrl(changeQualityModel);
                setCurrentVideoId(quality.videoId);
                setCurrentVideoQualityId(quality.id);
                if(isNewVideo) {
                    connection.send(SIGNALR_VIDEO_HUB_SEND_CHANGE_VIDEO, quality.videoId, "0");
                } else {
                    connection.send(SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, quality.videoId, "0");
                }
            } else if(!isRomchik()) {
                //if not Roma -> change quality
                if(quality.videoId == currentVideoId) {
                    let changeQualityModel = new ChangeQualityModel();
                    changeQualityModel.videoTimeStamp = playerRef.current.currentTime;
                    changeQualityModel.videoUrl = quality.url;
                    playerRef.current.pause();
                    setCurrentVideoUrl(changeQualityModel);
                    setCurrentVideoQualityId(quality.id);
                }
            }
        }
    }


    return (
        <>
            <div className={ (isFullscreen ? "fullscreen" : "") + " main-interface"}>
                <div className='video-player-wrapper'>
                    <ReactHlsPlayer
                        playerRef={playerRef}
                        src={currentVideoUrl.videoUrl}
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
            <div>
                <div className={(isFullscreen ? 'hidden' : '') + ' master-controls-wrapper'}>
                    <div className='add-video-wrapper'>
                        <div>Add Video:</div>

                        <label htmlFor="videoNameTxt">Video Name:</label>
                        <input 
                            type="text"
                            id="videoNameTxt"
                            name="videoNameTxt"
                            ref={videoNameTxt} />

                        <button onClick={onAddVideoClick}>Add Video</button>
                    </div>
                </div>

                <div className={(isFullscreen ? 'hidden' : '') + ' master-controls-wrapper'}>
                    <div className='add-video-quality-wrapper'>
                        <div>Add Video Quality:</div>

                        <label htmlFor="addVideoQualitySelectVideoDDL">Video Name:</label>
                        <select id="addVideoQualitySelectVideoDDL" name="addVideoQualitySelectVideoDDL" ref={addVideoQualitySelectVideoDDL}>
                        { videos.map((video, i) => {                 
                        return (
                            <option key={video.id} value={video.id}>{video.name}</option>
                        )})}
                        </select>

                        <label htmlFor="videoQualityNameTxt">Video Quality Name:</label>
                        <input 
                            type="text"
                            id="videoQualityNameTxt"
                            name="videoQualityNameTxt"
                            ref={videoQualityNameTxt} />

                        <label htmlFor="videoQualityUrlTxt">Video Quality Url:</label>
                        <input 
                            type="text"
                            id="videoQualityUrlTxt"
                            name="videoQualityUrlTxt"
                            ref={videoQualityUrlTxt} />

                        <label htmlFor="isHlsHdRezka">Is Hls HdRezka:</label>
                        <input
                            type="checkbox"
                            id="isHlsHdRezka"
                            name="isHlsHdRezka"
                            ref={isHlsHdRezka}
                            />

                        <button onClick={onAddVideoQualityClick}>Add Video Quality</button>
                    </div>
                </div>
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
                            <div key={quality.id} className='video-quality-item' onClick={(e) => onVideoQualityClick(quality) }>
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
