import './MainPage.css';
import ihorAvatar from "../images/ihor_smaller.jpg"
import oldIhorAvatar from "../images/oldihor.jpg"
import oldRomavatar from "../images/oldroma.jpg"
import andrewAvatar from "../images/andrew.jpg"
import romaAvatar from "../images/roma_2.jpg"
import capibaraAvatar from "../images/capibara.jpg"

import { useState, useEffect, useRef, SyntheticEvent, MouseEvent } from 'react';
import ReactHlsPlayer from "react-hls-player";
import Chat from '../components/Chat/Chat';
import { getTokenFromStorage, isMaster as isRomchik } from '../api/TokenStorageService';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { HD_REZKA_M3U8_PREFIX } from "../config"
import { BASE_VIDEO_HUB_URL, SIGNALR_VIDEO_HUB_RECEIVE_CHANGE_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO, 
    SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, 
    SIGNALR_VIDEO_HUB_RECEIVE_USER_STATUS, 
    SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, SIGNALR_VIDEO_HUB_SEND_CHANGE_VIDEO, SIGNALR_VIDEO_HUB_SEND_START_VIDEO, 
    SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO, SIGNALR_VIDEO_HUB_SEND_USER_STATUS, SIGNALR_VIDEO_HUB_SEND_VIDEO, SIGNALR_VIDEO_HUB_SEND_VIDEO_QUALITY, 
    SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP } from '../api/SignalREndpoints';
import { VideoModel } from '../models/Video/VideoModel';
import { getDisplayName, sortVideoQualityModel, VideoQualityModel } from '../models/Video/VideoQualityModel';
import { VideoTimeStampModel } from '../models/Video/VideoTimeStampModel';
import { getAllQualities, getAllVideos } from '../api/VideoService';
import { ChangeQualityModel } from '../models/ChangeQualityModel';
import { clear } from 'console';
import { UserVideoStatusModel } from '../models/Video/UserVideoStatusModel';

const MainPageComponent = () => {
    const [ videos, setVideos ] = useState<VideoModel[]>([]);
    const [ qualities, setQualities ] = useState<VideoQualityModel[]>([]); 
    const [ updateTimeIntervalId, setUpdateTimeIntervalId ] = useState<NodeJS.Timer>();
    const [ connection, setConnection ] = useState<HubConnection>();
    const [ accessToken, setAccessToken ] = useState<string>("");
    const [ currentVideoId, setCurrentVideoId ] = useState<string>("00000000-0000-0000-0000-000000000000");
    const [ currentVideoQualityId, setCurrentVideoQualityId ] = useState<string>("00000000-0000-0000-0000-000000000000");
    const [ isFullscreen, setIsFullscreen ] = useState<boolean>(false);
    const [ currentVideoUrl, setCurrentVideoUrl ] = useState<ChangeQualityModel>(new ChangeQualityModel);
    const [ isNewChatMessageReceived, setIsNewChatMessageReceived ] = useState<boolean>(false);
    const [ newChatMessageReceivedTimeoutId, setNewChatMessageReceivedTimeoutId ] = useState<NodeJS.Timeout | null>(null);
    const [ connectedUsersVideoStatus, setConnectedUsersVideoStatus ] = useState<UserVideoStatusModel[]>([]);
    const [ currentUpdateStatusIntervalId, setCurrentUpdateStatusIntervalId ] = useState<NodeJS.Timer>();

    const playerRef = useRef<HTMLVideoElement>(null);
    const videoNameTxt = useRef<HTMLInputElement>(null);
    const addVideoQualitySelectVideoDDL = useRef<HTMLSelectElement>(null);
    const videoQualityNameDdl = useRef<HTMLSelectElement>(null);
    const videoQualityUrlTxt = useRef<HTMLInputElement>(null);
    const isHlsHdRezka = useRef<HTMLInputElement>(null);


    // new data received
    const [ onReceiveNewVideoData, setOnReceiveNewVideoData ] = useState<VideoModel>();
    const [ onReceiveNewVideoQualityData, setOnReceiveNewVideoQualityData ] = useState<VideoQualityModel>();
    const [ onReceiveNewTimeStampData, setOnReceiveNewTimeStampData ] = useState<VideoTimeStampModel>();
    const [ onReceiveChangeVideoData, setOnReceiveChangeVideoData ] = useState<VideoTimeStampModel>();
    const [ onReceiveStartVideoData, setOnReceiveStartVideoData ] = useState<VideoTimeStampModel>();
    const [ onReceiveStopVideoData, setOnReceiveStopVideoData ] = useState<VideoTimeStampModel>();
    const [ onReceiveUserVideoStatusData, setOnReceiveUserVideoStatusData ] = useState<UserVideoStatusModel>();

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

    useEffect(() => {
        if(onReceiveUserVideoStatusData) {
            onReceiveUserVideoStatus(onReceiveUserVideoStatusData);
        }
    }, [onReceiveUserVideoStatusData]);

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
            setVideos(videoModels);
        });

        getAllQualities().then((response) => {
            let videoQualitiesModels = response.data as VideoQualityModel[];
            setQualities(videoQualitiesModels);
        });
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
                    console.log('Connected to video Hub!');
                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO, message => {
                        let model = message as VideoModel;
                        setOnReceiveNewVideoData(model)
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY, message => {
                        let model = message as VideoQualityModel;
                        setOnReceiveNewVideoQualityData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_CHANGE_VIDEO, message => {
                        let model = message as VideoTimeStampModel;
                        setOnReceiveChangeVideoData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP, message => {
                        let model = message as VideoTimeStampModel;
                        setOnReceiveNewTimeStampData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO, (message) => {
                        let model = message as VideoTimeStampModel;
                        setOnReceiveStartVideoData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO, (message) => {
                        let model = message as VideoTimeStampModel;
                        setOnReceiveStopVideoData(model);
                    });

                    connection.on(SIGNALR_VIDEO_HUB_RECEIVE_USER_STATUS, (message) => {
                        let model = message as UserVideoStatusModel;
                        setOnReceiveUserVideoStatusData(model);
                    });

                    // update other users
                    sendCurrentStatusToUsers();
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
            if(model.timeStamp && model.videoId) {
                if(model.videoId != currentVideoId) {
                    onReceiveChangeVideo(model);
                } else {
                    let mastersTimeStamp = Number(model.timeStamp);
                    if(playerRef && playerRef.current && (checkIfUserIsNotSynchronized(mastersTimeStamp) || model.isForce)) {
                        playerRef.current.currentTime = mastersTimeStamp;
                    }
                }
            }
        }
    }

    const onReceiveChangeVideo = (model: VideoTimeStampModel) => {
        let maxQuality = new VideoQualityModel();
        maxQuality.id = "00000000-0000-0000-0000-000000000000";
        maxQuality.name = "0";
        for(let i=0; i < qualities.length; i++) {
            if(qualities[i].videoId == model.videoId) {
                let maxQualityNum = Number(maxQuality.name);
                let curQualityNum = Number(qualities[i].name);
                if(!isNaN(maxQualityNum) && !isNaN(curQualityNum)){
                    if(maxQualityNum < curQualityNum){
                        maxQuality = qualities[i];
                    }
                } else {
                    maxQuality = qualities[i];
                }
            }
        }
        setCurrentVideoId(model.videoId);
        setCurrentVideoQualityId(q => maxQuality.id);
        let changeQualitymodel = new ChangeQualityModel();
        changeQualitymodel.videoUrl = maxQuality.url;
        changeQualitymodel.videoTimeStamp = 0;
        setCurrentVideoUrl(changeQualitymodel);
    }

    const onReceiveStartVideo = (model: VideoTimeStampModel) => {
        if(playerRef && playerRef.current) {
            if(!isRomchik()) {
                playerRef.current.currentTime = Number(model.timeStamp); 
            }

            playerRef.current.play();
        }
    }

    const onReceiveStopVideo = (model: VideoTimeStampModel) => {
        if(!isRomchik()) {
            if (playerRef && playerRef.current) {
                playerRef.current.currentTime = Number(model.timeStamp);
                playerRef.current.pause();
            }
        }
    }

    const onReceiveUserVideoStatus = (model: UserVideoStatusModel) => {
        let isNewUser: boolean = true;

        if(connectedUsersVideoStatus && connectedUsersVideoStatus.length > 0) {
            for(let i=0; i < connectedUsersVideoStatus.length; i++) {
                if(connectedUsersVideoStatus[i].userId == model.userId) {
                    let saveModel = connectedUsersVideoStatus;
                    saveModel[i] = model;
                    isNewUser = false;
                    setConnectedUsersVideoStatus(saveModel);
                    break;
                } 
            }
        }

        if(isNewUser) {
            setConnectedUsersVideoStatus([...connectedUsersVideoStatus, model]);
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

    const convertStringToTime = (timestamp: string) => {
        var sec_num = parseInt(timestamp, 10)
        var hours   = Math.floor(sec_num / 3600)
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60

        return [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":")
    }

    const sendCurrentStatusToUsers = () => {
        if(currentUpdateStatusIntervalId) {} else {
            console.log("creating interval to update user status");
            let _currentUpdateStatusIntervalId = setInterval(() => {
                if(connection && connection.state == HubConnectionState.Connected) {
                    let additionalData = ""
                    let status = 0;
                    let currentTimeStamp = "";
                    if(playerRef && playerRef.current) {
                        //https://html.spec.whatwg.org/multipage/media.html#the-ready-states
                        //HAVE_ENOUGH_DATA = 4 - ready to play(Loaded) 
                        // 0,1,2,3 - loading, I guess
                        if(playerRef.current.readyState == 0 || playerRef.current.readyState == 1) {
                            status = 2;
                        } else {
                            if(playerRef.current.paused) {
                                status = 0;
                            } else {
                                status = 1;
                            }
                        }
                        currentTimeStamp = playerRef.current.currentTime.toString();
                    }
                    connection.send(SIGNALR_VIDEO_HUB_SEND_USER_STATUS, status, currentTimeStamp, additionalData);
                }
            }, 1000);

            setCurrentUpdateStatusIntervalId(_currentUpdateStatusIntervalId);
        }
    }

    const updateVideoTimeForClients = () => {
        if(playerRef.current && connection && connection.state == HubConnectionState.Connected) {
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
        && videoQualityNameDdl && videoQualityNameDdl.current && videoQualityNameDdl.current.value
        && videoQualityUrlTxt && videoQualityUrlTxt.current && videoQualityUrlTxt.current.value
        && addVideoQualitySelectVideoDDL && addVideoQualitySelectVideoDDL.current && addVideoQualitySelectVideoDDL.current.value
        && isHlsHdRezka && isHlsHdRezka.current) {
            let checkQualityName = Number(videoQualityNameDdl.current.value);
            if(!isNaN(checkQualityName)) {
                let url = videoQualityUrlTxt.current.value;
                if (isHlsHdRezka.current.checked) {
                    url += HD_REZKA_M3U8_PREFIX;
                }
                connection.send(SIGNALR_VIDEO_HUB_SEND_VIDEO_QUALITY, addVideoQualitySelectVideoDDL.current.value, url, videoQualityNameDdl.current.value);
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

    const onVideoNameClick = (e: MouseEvent<HTMLDivElement>) => {
        if(e && e.currentTarget && e.currentTarget.nextElementSibling) {
            if(e.currentTarget.nextElementSibling.classList.contains('dont-show')) {
                e.currentTarget.nextElementSibling.classList.remove('dont-show');
            } else {
                e.currentTarget.nextElementSibling.classList.add('dont-show');
            }
        }
    }

    const onNewMessageReceived = () => {
        //clear previous timeout
        if(newChatMessageReceivedTimeoutId && newChatMessageReceivedTimeoutId != null) {
            clearTimeout(newChatMessageReceivedTimeoutId);
        }
        //show messages
        setIsNewChatMessageReceived(true);
        
        //hide message after 5 secs
        let timeout = setTimeout(() => {
            if(newChatMessageReceivedTimeoutId && newChatMessageReceivedTimeoutId != null) {
                clearTimeout(newChatMessageReceivedTimeoutId);
            }
            setNewChatMessageReceivedTimeoutId(null);
            setIsNewChatMessageReceived(false);
        }, 5000);

        //set new timeoutId to clear
        setNewChatMessageReceivedTimeoutId(timeout);
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
                <div className={(isNewChatMessageReceived ? 'new-message-received ' : '') + 'chat-wrapper'}>
                    <Chat isFullscreen={isFullscreen} onNewMessageReceived={onNewMessageReceived}/>
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

            <div className="user-data-wrapper">
            { connectedUsersVideoStatus.map((userVideoStatus, i) => { return (
                <div className='user-data-item'>
                    <div className="user-avatar-wrapper">
                        {userVideoStatus.userName==='Rom4ik' ? <img className='user-avatar' src="https://static8.tgstat.ru/channels/_0/90/908e7729970bbb8837e0f4e5e83b15da.jpg" /> : 
                        userVideoStatus.userName==='s1lence' ? <img className='user-avatar' src={romaAvatar} /> :
                        userVideoStatus.userName==='Andrew' ? <img className='user-avatar' src={andrewAvatar} /> :
                        userVideoStatus.userName==='Ihor' ? <img className='user-avatar' src={ihorAvatar} /> : 
                        userVideoStatus.userName==='Capibara' ? <img className='user-avatar' src={capibaraAvatar} /> : 
                        <img className='user-avatar' src={oldIhorAvatar} />}
                    </div>
                    <div>{userVideoStatus.userName}</div>
                    <div>{convertStringToTime(userVideoStatus.videoTimeStamp)}</div>    
                    <div className='user-status'>
                    {userVideoStatus.status == 0 ?
                        <div>
                            Pause
                        </div>
                    :
                    userVideoStatus.status == 1 ?
                        <div>
                            Play
                        </div>
                    :
                    userVideoStatus.status == 2 ?
                        <div>
                            Loading
                        </div>
                    :
                        <div>
                            Something is going on here, IDK
                        </div>
                    }
                    </div>
                </div>
            );})}
            </div>

            { isRomchik() ?
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

                        <label htmlFor="videoQualityNameDdl">Video Quality:</label>
                        <select id="videoQualityNameDdl" name="videoQualityNameDdl" ref={videoQualityNameDdl}>
                            <option value="360">360p</option>
                            <option value="480">480p</option>
                            <option value="720">720p</option>
                            <option value="1080">1080p</option>
                            <option value="1081">1080 Ultra</option>
                            <option value="2160">2K</option>
                            <option value="4320">4K</option>
                        </select>

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
                    <div onClick={onVideoNameClick} className={ (video.id == currentVideoId ? 'selected' : '') + ' video-name'}>{video.name}</div>
                    <div className={ (video.id == currentVideoId ? '' : 'dont-show') + ' video-quality-list'}>
                    { qualities.sort((a,b) => sortVideoQualityModel(a,b)).map((quality, i) => {
                    if(quality.videoId == video.id) return (    
                        <div key={quality.id} className={(quality.id == currentVideoQualityId ? 'selected' : '') + ' video-quality-item'} onClick={(e) => onVideoQualityClick(quality) }>
                            <div className='video-quality-name'>{getDisplayName(quality)}</div>
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
