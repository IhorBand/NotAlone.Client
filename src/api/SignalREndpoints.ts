export const BASE_CHAT_HUB_URL = "https://kozachok.monster/hubs/chathub";
export const BASE_VIDEO_HUB_URL = "https://kozachok.monster/hubs/videohub";

/*
    In: string message
    out: MessageModel
*/
export const SIGNALR_CHAT_HUB_SEND_MESSAGE = "SendMessageAsync";
export const SIGNALR_CHAT_HUB_RECEIVE_MESSAGE = "ReceiveMessage";

/*
    In: int avatarId
    out:  int avatarId, string UserId, string UserName 
*/
export const SIGNALR_CHAT_HUB_SEND_CHANGE_AVATAR = "SendChangeAvatarAsync";
export const SIGNALR_CHAT_HUB_RECEIVE_CHANGE_AVATAR = "ReceiveChangeAvatarAsync"


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
export const SIGNALR_VIDEO_HUB_SEND_CHANGE_VIDEO = "SendСhangeVideoAsync";
export const SIGNALR_VIDEO_HUB_RECEIVE_CHANGE_VIDEO = "ReceiveChangeVideo";

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
    
/*
    In: string videoId, string timestamp
    out: VideoTimeStampModel
*/
export const SIGNALR_VIDEO_HUB_SEND_USER_STATUS = "SendUserStatusAsync";
export const SIGNALR_VIDEO_HUB_RECEIVE_USER_STATUS = "ReceiveUserStatus";
