import { AuthorizationModel } from "../models/Auth/AuthorizationModel";
import { RefreshTokenModel } from "../models/Auth/RefreshTokenModel";
import Api from "./api";

export const authorizeUser = async (model: AuthorizationModel) => {
	const response = await Api.post(`token/token`,model);
	return response;
};

export const refreshToken = async (model: RefreshTokenModel) => {
	const response = await Api.post(`token/refreshToken`, model);
	return response;
};