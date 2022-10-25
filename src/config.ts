export const BASE_CHAT_HUB_URL = "http://localhost:5070/hubs/chathub";
export const BASE_VIDEO_HUB_URL = "http://localhost:5070/hubs/videohub";
export const BASE_URL = "http://localhost:5070/api/";

/*
    In: string message
    out: MessageModel
*/
export const SIGNALR_CHAT_HUB_SEND_MESSAGE = "SendMessageAsync";
export const SIGNALR_CHAT_HUB_RECEIVE_MESSAGE = "ReceiveMessage";

/*
    In: string name
    out: VideoModel
*/
export const SIGNALR_VIDEO_HUB_SEND_VIDEO = "SendVideoAsync";
export const SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO = "ReceiveVideo";

/*
    In: string videoId, string url, string name
    out: VideoQualityModel
*/
export const SIGNALR_VIDEO_HUB_SEND_VIDEO_QUALITY = "SendVideoQualityAsync";
export const SIGNALR_VIDEO_HUB_RECEIVE_NEW_VIDEO_QUALITY = "ReceiveVideoQuality";

/*
    In: string videoId, string timestamp, bool isForce
    out: VideoTimeStampModel
*/
export const SIGNALR_VIDEO_HUB_SEND_VIDEO_TIMESTAMP = "SendNewVideoTimeStampAsync";
export const SIGNALR_VIDEO_HUB_RECEIVE_VIDEO_TIMESTAMP = "ReceiveNewVideoTimeStamp";

/*
    In: string videoId, string timestamp
    out: VideoTimeStampModel
*/
export const SIGNALR_VIDEO_HUB_SEND_START_VIDEO = "SendStartVideoAsync";
export const SIGNALR_VIDEO_HUB_RECEIVE_START_VIDEO = "ReceiveStartVideo";

/*
    In: string videoId, string timestamp
    out: VideoTimeStampModel
*/
export const SIGNALR_VIDEO_HUB_SEND_STOP_VIDEO = "SendStopVideoAsync";
export const SIGNALR_VIDEO_HUB_RECEIVE_STOP_VIDEO = "ReceiveStopVideo";
