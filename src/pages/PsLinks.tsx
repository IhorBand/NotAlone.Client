import './PsLinks.css';

import { useEffect, useState } from "react";
import { getTokenFromStorage } from "../api/TokenStorageService";
import { getAllVideos, getAllQualities } from "../api/VideoService";
import { HD_REZKA_M3U8_PREFIX } from "../config";
import { VideoModel } from "../models/Video/VideoModel";
import { getDisplayName, sortVideoQualityModel, VideoQualityModel } from "../models/Video/VideoQualityModel";

const PsLinksPage = () => {
    const [ accessToken, setAccessToken ] = useState<string>("");
    const [ videos, setVideos ] = useState<VideoModel[]>([]);
    const [ qualities, setQualities ] = useState<VideoQualityModel[]>([]); 


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


    return (
        <>
            <div className="ps-links-video-list-container">
            { videos.map((video, i) => {                 
            return (
                <div key={video.id} className="ps-links-video-item-container" >
                    <div className="ps-links-video-item-name">
                        Name: {video.name}
                    </div>
                    <div className="ps-links-video-item-qualities-container-wrapper">
                        <div className="ps-links-video-item-qualities-container-wrapper-label">
                            Qualities:
                        </div>
                        <div className="ps-links-video-item-qualities-container">
                        { qualities.sort((a,b) => sortVideoQualityModel(a,b)).map((quality, i) => {
                        if(quality.videoId == video.id) return (    
                            <div key={quality.id} className={'ps-links-video-quality-item'}>
                                <div className='ps-links-video-quality-name'><a href={quality.url.replace(HD_REZKA_M3U8_PREFIX, '')}>{getDisplayName(quality)}</a></div>
                            </div>
                        )})}
                        </div>
                    </div>
                </div>
            )})}
            </div>
        </>
    )
};

export default PsLinksPage;