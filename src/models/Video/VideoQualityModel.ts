export class VideoQualityModel {
    public id: string = "";
    public videoId: string = "";
    public name: string = "";
    public url: string = "";

    public constructor() {
    }
}

export const sortVideoQualityModel = (n1 : VideoQualityModel, n2 : VideoQualityModel) => {
	let n1Num: number = Number(n1.name);
    let n2Num: number = Number(n2.name);

    if(!isNaN(n1Num) && !isNaN(n2Num)) {
        if (n1Num > n2Num) {
            return 1;
        }

        if (n1Num < n2Num) {
            return -1;
        }
    }
    return 0;
};

export const getDisplayName = (vqm : VideoQualityModel) => {
	if(vqm.name == "360" || vqm.name == "480" || vqm.name == "720" || vqm.name == "1080") {
        return vqm.name + "p";
    } else if(vqm.name == "1081") {
        return "1080p Ultra";
    } else {
        return vqm.name.at(0) + "K";
    }
    
    return "somebody once told that world is gonna roll me.";
};