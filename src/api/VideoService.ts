import Api from "./api";

export const getAllVideos = async () => {
	const response = await Api.get(`Videos`);
	return response;
};

export const getQualitiesByVideoId = async (videoId: string) => {
	const response = await Api.get(`Video/${videoId}/Qualities`);
	return response;
};

export const getAllQualities = async () => {
	const response = await Api.get(`Video/Qualities`);
	return response;
};
