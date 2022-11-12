import Api from "./api";


export const searchMovies = async (query: string, pageIndex: number) => {
	const response = await Api.get(`search?q=${query}&pageIndex=${pageIndex}`);
	return response;
}

export const getAnimeList = async (pageIndex: number) => {
	const response = await Api.get(`animations?pageIndex=${pageIndex}`);
	return response;
};

export const getFilmsList = async (pageIndex: number) => {
	const response = await Api.get(`films?pageIndex=${pageIndex}`);
	return response;
};

export const getCartoonsList = async (pageIndex: number) => {
	const response = await Api.get(`cartoons?pageIndex=${pageIndex}`);
	return response;
};

export const getSeriesList = async (pageIndex: number) => {
	const response = await Api.get(`series?pageIndex=${pageIndex}`);
	return response;
};

export const getNewsList = async (pageIndex: number) => {
	const response = await Api.get(`new?pageIndex=${pageIndex}`);
	return response;
};




// Get Movie

export const getMovieTranslators = async (filmUrlId: string) => {
	const response = await Api.get(`movie/translators?filmUrlId=${filmUrlId}`);
	return response;
};

export const getMovieSeasons = async (filmId: string, translatorId: string) => {
	const response = await Api.get(`movie/seasons?filmId=${filmId}&translatorId=${translatorId}`);
	return response;
};

export const getMovieType = async (filmUrlId: string) => {
	const response = await Api.get(`movie/type?filmUrlId=${filmUrlId}`);
	return response;
};

export const getMovieStream = async (filmId: string, translatorId: string, filmType: string, season: string, episode: string) => {
	const response = await Api.get(`movie/stream?filmId=${filmId}&translatorId=${translatorId}&filmType=${filmType}&season=${season}&episode=${episode}`);
	return response;
};
