import { VideoEpisodeModel } from "./VideoEpisodeModel";
import { VideoResolutionModel } from "./VideoResolutionModel";
import { VideoSeasonModel } from "./VideoSeasonModel";

export class VideoStreamModel {
    public resolutions: VideoResolutionModel[] = Array<VideoResolutionModel>();
    public episode: string = "";
    public season: string = "";

    public constructor() {
    }
}