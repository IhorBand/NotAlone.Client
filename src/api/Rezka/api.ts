import axios, { Canceler, ParamsSerializerOptions, RawAxiosRequestHeaders } from "axios";
import { BASE_REZKA_SCRAPPER_URL } from "./apiEndpoints";

interface HttpResponse {
	headers: any;
	data: any;
}

const get = async (
	url: string,
	data?: any,
	paramsSerializer?: ParamsSerializerOptions
): Promise<HttpResponse> => {
    const response = await axios.get(BASE_REZKA_SCRAPPER_URL + url, {
        params: data,
        paramsSerializer: paramsSerializer,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
    return response;
};

const post = async (
    url: string, 
    data?: any
): Promise<HttpResponse> => {
    const response = await axios.post(BASE_REZKA_SCRAPPER_URL + url, data, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    });
    return response;
};

const put = async (
    url: string, 
    data?: any
): Promise<HttpResponse> => {
    const response = await axios.put(BASE_REZKA_SCRAPPER_URL + url, data, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
    return response;
};

const remove = async (
	url: string,
	data?: any,
	options: any = {},
): Promise<HttpResponse> => {
    const response = await axios.delete(BASE_REZKA_SCRAPPER_URL + url, {
        ...options,
        params: data,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    });
    return response;
};
export default { get, post, put, remove };
