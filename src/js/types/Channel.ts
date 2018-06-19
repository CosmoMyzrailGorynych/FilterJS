class Channel {
    width: number;
    height: number;
    data: Array<number> = [];
    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
    }
}

export = Channel;
