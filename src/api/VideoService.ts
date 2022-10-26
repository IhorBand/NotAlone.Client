import { AuthorizationModel } from "../models/Auth/AuthorizationModel";
import { RefreshTokenModel } from "../models/Auth/RefreshTokenModel";
import Api from "./api";

export const getAllVideos = async () => {
	const response = await Api.get(`Videos`);
	return response;
};

export const getQualitiesByVideoId = async (videoId: string) => {
	const response = await Api.get(`Video/${videoId}/Qualities?videoId=${videoId}`);
	return response;
};
