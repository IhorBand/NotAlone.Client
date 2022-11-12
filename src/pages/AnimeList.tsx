import './AnimeList.css';

import React, { useState, useRef, useEffect, MouseEvent, ChangeEvent } from 'react';
import { Navigate } from "react-router-dom";
import { authorizeUser } from '../api/AuthorizationService';
import { AuthorizationModel } from '../models/Auth/AuthorizationModel';
import { TokenModel } from '../models/Auth/TokenModel';
import { setTokenToStorage } from '../api/TokenStorageService';
import { VideoInformationModel } from '../models/Rezka/VideoInformationModel';
import { getAnimeList, getCartoonsList, getFilmsList, getMovieSeasons, getMovieStream, getMovieTranslators, getMovieType, getNewsList, getSeriesList, searchMovies } from '../api/Rezka/MoviesService';
import { VideoTranslatorModel } from '../models/Rezka/VideoTranslatorModel';
import { VideoSeasonsModel } from '../models/Rezka/VideoSeasonsModel';
import { VideoMovieTypeModel } from '../models/Rezka/VideoMovieTypeModel';
import { VideoStreamModel } from '../models/Rezka/VideoStreamModel';

export interface AnimeListComponentProps {
    onMovieEpisodeSelected: (episodes: AddVideoEpisodeEventModel[]) => void;
    onBackToRoomClick: () => void;
}

export class AddVideoEpisodeEventModel {
    public stream: VideoStreamModel = new VideoStreamModel();
    public movieName: string = "";
    public videoId: string = "";
    
    public constructor() {
    }
}

const AnimeListComponent = (props : AnimeListComponentProps) => {
    const [ isLoading, setIsLoading ] = useState<boolean>(false);
    
    const [ isSearchOpened, setIsSearchOpened ] = useState<boolean>(false); 
    const [ searchQuery, setSearchQuery ] = useState<string>("");

    const [ animeList, setAnimeList ] = useState<VideoInformationModel[]>([]);
    const [ pageIndex, setPageIndex ] = useState<number>(1);
    const [ categoryId, setCategoryId ] = useState<string>("0");
    const [ selectedFilmInfo, setSelectedFilmInfo ] = useState<VideoInformationModel>();

    const [ translatorList, setTranslatorList ] = useState<VideoTranslatorModel[]>([]);
    const [ seasonList, setSeasonList ] = useState<VideoSeasonsModel>();
    const [ movieType, setMovieType ] = useState<VideoMovieTypeModel>();
    const [ movieStream, setMovieStream ] = useState<VideoStreamModel>();

    const [ selectedTranslatorId, setSelectedTranslatorId ] = useState<string>("");

    const [ selectedStreams, setSelectedStreams ] = useState<VideoStreamModel[]>([]);

    const categoryIdDdl = useRef<HTMLSelectElement>(null);
    const searchQueryTxt = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(animeList.length <= 0) {
            setIsLoading(true);
            getAnimeList(1).then(response => {
                let models = response.data as VideoInformationModel[];
                setAnimeList(models);
                setIsLoading(false);
            })
        }
    }, []);

    useEffect(() => {
        loadMovies();
    }, [pageIndex]);

    useEffect(() => {
        loadMovies();
    }, [categoryId]);

    useEffect(() => {
        if(selectedFilmInfo && selectedFilmInfo.VideoID.trim() != "") {
            loadSelectedMovie(selectedFilmInfo.RezkaUrl);
        }
    }, [selectedFilmInfo]);

    useEffect(() => {
        if(isLoading) {
            window.scrollTo(0,0);
        }
    }, [isLoading]);

    const loadMovies = () => {
        setIsLoading(true);
        if(isSearchOpened) {
            searchMovies(searchQuery, pageIndex).then((response) => {
                let models = response.data as VideoInformationModel[];
                setAnimeList(models);
                setIsLoading(false);
            });
        } else {
            if(categoryId == "0") {
                getAnimeList(pageIndex).then(response => {
                    let models = response.data as VideoInformationModel[];
                    setAnimeList(models);
                    setIsLoading(false);
                });
            } else if (categoryId == "1") {
                getFilmsList(pageIndex).then(response => {
                    let models = response.data as VideoInformationModel[];
                    setAnimeList(models);
                    setIsLoading(false);
                });
            } else if (categoryId == "2") {
                getCartoonsList(pageIndex).then(response => {
                    let models = response.data as VideoInformationModel[];
                    setAnimeList(models);
                    setIsLoading(false);
                });
            } else if (categoryId == "3") {
                getSeriesList(pageIndex).then(response => {
                    let models = response.data as VideoInformationModel[];
                    setAnimeList(models);
                    setIsLoading(false);
                });
            } else if (categoryId == "4") {
                getNewsList(pageIndex).then(response => {
                    let models = response.data as VideoInformationModel[];
                    setAnimeList(models);
                    setIsLoading(false);
                });
            }
        }
    }

    const loadSelectedMovie = (filmUrlId: string) => {
        setIsLoading(true);
        getMovieType(filmUrlId).then(response => {
            let movieTypeModel = response.data as VideoMovieTypeModel;
            setMovieType(movieTypeModel);
            getMovieTranslators(filmUrlId).then(innerResponse => {
                let model = innerResponse.data as VideoTranslatorModel[];
                setTranslatorList(model);
                setIsLoading(false);
            });
        });
    }

    const loadSeasons = (translatorId: string) => {
        setIsLoading(true);
        if(selectedFilmInfo && movieType && movieType.MovieType == "video.tv_series" ) {
            getMovieSeasons(selectedFilmInfo.VideoID, translatorId).then(response => {
                let movieSeasons = response.data as VideoSeasonsModel;
                setSeasonList(movieSeasons);
                setIsLoading(false);
            });
        }
        else if (selectedFilmInfo && movieType && movieType.MovieType == "video.movie" ) {
            setIsLoading(true);
            getMovieStream(selectedFilmInfo.VideoID, translatorId, movieType.MovieType, "1", "1").then(response => {
                let model = response.data as VideoStreamModel;
                setSelectedStreams([model]);
                addSeriesToRoom([model]);
                setIsLoading(false);
            });
        }
    }

    const onNextClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setPageIndex(pageIndex+1);
    }

    const onBackClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(pageIndex > 1) {
            setPageIndex(pageIndex-1);
        }
    }

    const onCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        if(e && e.currentTarget && e.currentTarget.value) {
            setCategoryId(e.currentTarget.value);
        }
    }

    const onMovieClick = (videoInfo: VideoInformationModel) => {
        setSelectedFilmInfo(videoInfo);
    }

    const onTranslatorClick = (translatorId: string) => {
        setSelectedTranslatorId(translatorId);
        setSelectedStreams(new Array<VideoStreamModel>());
        loadSeasons(translatorId);
    }

    const onEpisodeClick = (episodeId: string, seasonId: string) => {
        if(selectedFilmInfo && selectedFilmInfo.VideoID && movieType) {
            let isRemoved = false;
            for(let i = 0; i < selectedStreams.length; i++) {
                if(selectedStreams[i].season == seasonId && selectedStreams[i].episode == episodeId) {
                    if(selectedStreams.length > 1) {
                        let tmp = selectedStreams.filter(s => (s.episode != episodeId) || (s.episode == episodeId && s.season != seasonId));
                        setSelectedStreams(tmp);
                    } else {
                        setSelectedStreams(new Array<VideoStreamModel>());
                    }
                    isRemoved = true;
                    break;
                }
            }
            if(!isRemoved) {
                setIsLoading(true);
                getMovieStream(selectedFilmInfo.VideoID, selectedTranslatorId, movieType.MovieType, seasonId, episodeId).then(response => {
                    let model = response.data as VideoStreamModel;
                    setSelectedStreams([...selectedStreams, model]);
                    setIsLoading(false);
                });
            }
        }
    }

    const removeSelectedDataAndGoBackToMenu = () => {
        setSelectedFilmInfo(undefined);
        setTranslatorList(new Array<VideoTranslatorModel>());
        setSeasonList(undefined);
        setMovieType(undefined);
        setMovieStream(undefined);
        setSelectedStreams(new Array<VideoStreamModel>());
    }

    const addSeriesToRoom = (selectedStreams: VideoStreamModel[]) => {
        let selectedEpisodes = new Array<AddVideoEpisodeEventModel>();
        if(selectedFilmInfo) {
            for(let i = 0; i < selectedStreams.length; i++) {
                let ep = new AddVideoEpisodeEventModel();
                ep.stream = selectedStreams[i];
                ep.movieName = selectedFilmInfo.VideoName;
                ep.videoId = selectedFilmInfo.VideoID;
                selectedEpisodes.push(ep);
            }

            props.onMovieEpisodeSelected(selectedEpisodes);
        }
        removeSelectedDataAndGoBackToMenu();
    }

    const onAddSeriesToRoomClick = () => {
        addSeriesToRoom(selectedStreams);
    }

    const onGoBackClick = () => {
        removeSelectedDataAndGoBackToMenu();
    }

    const onBackToRoomClick = () => {
        props.onBackToRoomClick();
    }

    const toogleSearchControls = () => {
        setIsSearchOpened(!isSearchOpened);
    }

    const onSearchClick = () => {
        if(searchQueryTxt && searchQueryTxt.current && searchQueryTxt.current.value && searchQueryTxt.current.value.trim() != "") {
            let param = encodeURIComponent(searchQueryTxt.current.value);
            setPageIndex(1);
            setSearchQuery(param);
            setIsLoading(true);
            searchMovies(param, 1).then((response) => {
                let models = response.data as VideoInformationModel[];
                setAnimeList(models);
                setIsLoading(false);
            });
        }
    }

    return (
        <>
            <div>
                {isLoading ?
                <div className='loading-container'>
                    <div className='loading'>
                        ...Loading...
                    </div>
                </div>
                :
                    selectedFilmInfo && selectedFilmInfo.VideoID.trim() != "" ? 
                    <div>

                        <div className='video-info'>
                            <div className="video-info-cover-wrapper">
                                <img src={selectedFilmInfo.CoverUrl} />
                            </div>
                            <div className='video-info-name'>
                                {selectedFilmInfo.VideoName}
                            </div>
                            <div className="video-info-description">
                                {selectedFilmInfo.VideoDescription}
                            </div>
                        </div>

                        <div className='translators-label'>
                            Translators:
                        </div>
                        <div className='translator-item-container'>
                            { translatorList ? translatorList.map((translator, i) => { return (
                            <div key={i+translator.TranslatorID} className={'translator-item' + (translator.TranslatorID == selectedTranslatorId ? ' selected' : "")} onClick={(e) => onTranslatorClick(translator.TranslatorID)}>
                                <div>
                                    {translator.TranslatorName}
                                </div>
                            </div>
                            );}) : ""}
                        </div>
                        <div className='seasons-label'>
                            Seasons:
                        </div>
                        <div className='season-item-container'>
                            { seasonList ? seasonList.seasons.map((season, i) => { return (
                            <div key={i+season.seasonID} className={'season-item' + (selectedStreams.find((s) => s.season == season.seasonID) ? ' selected' : '')}>
                                <div className='episodes-label'>
                                    {season.seasonName}
                                </div>
                                <div className='episode-item-container'>
                                    { seasonList ? seasonList.episodes.map((episode, i) => { return episode && episode.seasonID == season.seasonID ? (
                                        <div key={i+episode.episodeID} className={'episode-item' + (selectedStreams.find((s) => s.episode == episode.episodeID && s.season == episode.seasonID) ? ' selected' : '')} onClick={(e) => onEpisodeClick(episode.episodeID, episode.seasonID)}>
                                            <div>
                                                {episode.episodeName}
                                            </div>
                                        </div>
                                    ) : (<></>)}) : ""}
                                </div>
                            </div>
                            );}) : ""}
                        </div>
                        <div className='view-movie-controls-list'>
                            <div className='add-episodes-button' onClick={(e) => onAddSeriesToRoomClick()}>
                                Add Episodes To Room
                            </div>
                            <div className='go-back-button' onClick={(e) => onGoBackClick()}>
                                Go Back
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        <div className='searchControls'>
                            <select id="categoryIdDdl" className={"category-dll" + (isSearchOpened ? " not-displayed" : "")} defaultValue={categoryId} name="categoryIdDdl" onChange={onCategoryChange} ref={categoryIdDdl}>
                                <option value="0">Anime</option>
                                <option value="1">Films</option>
                                <option value="2">Cartoons</option>
                                <option value="3">Series</option>
                                <option value="4">Новинки</option>
                            </select>
                            <input 
                                type="text"
                                id="searchQueryTxt"
                                name="searchQueryTxt"
                                className={'search-query-txt' + (isSearchOpened ? "" : " not-displayed")}
                                defaultValue={searchQuery}
                                ref={searchQueryTxt} />
                            <button className={'search-query-btn' + (isSearchOpened ? "" : " not-displayed")} onClick={(e) => onSearchClick()}>Search</button>

                            <button onClick={toogleSearchControls}>{isSearchOpened ? "Close" : "Open"} Search</button>
                        </div>
                        <div className='paging-control'>
                            <button onClick={onBackClick}>Back</button>    
                            <div className='current-page-index'>
                                {pageIndex}
                            </div>
                            <button className='next-button' onClick={onNextClick}>Next</button>
                        </div>
                        <div className='video-list-container'>
                        { animeList.map((videoInfo, i) => { return (
                            <div className='video-item' key={i} onClick={(e) => onMovieClick(videoInfo)}>
                                <div className='video-item-cover-container'>
                                    <div className='video-item-cover'>
                                        <img src={videoInfo.CoverUrl} />
                                    </div>
                                </div>
                                <div className='video-item-info-container'>
                                    <div className='video-item-name'>
                                        {videoInfo.VideoName}
                                    </div>
                                    <div className='video-item-description'>
                                        {videoInfo.VideoDescription}
                                    </div>
                                    <div className='video-item-id'>
                                        {videoInfo.VideoID}
                                    </div>
                                </div>
                            </div>
                        );})}
                        </div>
                        <div>
                            <button onClick={onBackToRoomClick}>Go Back To Room</button>    
                        </div>
                        <div className='paging-control'>
                            <button onClick={onBackClick}>Back</button>    
                            <div className='current-page-index'>
                                {pageIndex}
                            </div>
                            <button className='next-button' onClick={onNextClick}>Next</button>
                        </div>
                    </div>
                }
            </div>
        </>
    )
};

export default AnimeListComponent;