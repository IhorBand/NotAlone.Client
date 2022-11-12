import { VideoEpisodeModel } from "./VideoEpisodeModel";
import { VideoSeasonModel } from "./VideoSeasonModel";

export class VideoSeasonsModel {
    public episodes: VideoEpisodeModel[] = Array<VideoEpisodeModel>();
    public seasons: VideoSeasonModel[] = Array<VideoSeasonModel>();
    public translator_id: string = "";

    public constructor() {
    }
}