class Channel {
    width: number;
    height: number;
    data: Uint8Array;
    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.data = new Uint8Array(w * h);
    }
}

export = Channel;
