import { TokenModel } from "../models/Auth/TokenModel";

export const getTokenFromStorage = (): TokenModel | null => {
	let tokenStr = sessionStorage.getItem('tokenInfo');
	if(tokenStr) {
		let token = JSON.parse(tokenStr);
		return token as TokenModel;
	}
	return null;
};

export const setTokenToStorage = (model: TokenModel) => {
	sessionStorage.setItem('tokenInfo', JSON.stringify(model));
	if(model.userName == "Rom4ik" || model.userName == "Ihor") {
		sessionStorage.setItem('isMaster', "1");
	} else {
		sessionStorage.setItem('isMaster', "0");
	}
};

export const isMaster = (): boolean => {
	if(sessionStorage.getItem('isMaster') == "1") {
		return true;
	}
	return false;
};