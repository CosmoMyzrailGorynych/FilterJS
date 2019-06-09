import Filter = require('./types/Filter.js');
import Block = require('./types/Block.js');
import LinkType = require('./types/LinkType.js');

class GlobalData {
    width: number = 1024;
    height: number = 1024;
    seed: number = 0;
    sourceImage: HTMLCanvasElement;
    filter: Filter;
    drawnLink: {
        inputKey?: string;
        outKey?: string;
        inputBlock?: Block;
        outBlock?: Block;
        type?: LinkType;
        fromX: number;
        fromY: number;
    };
    selectedBlocks: Array<any>;
    constructor() {
        this.drawnLink = {
            fromX: 0,
            fromY: 0
        };
        this.sourceImage = document.createElement('canvas');
        this.sourceImage.width = this.width;
        this.sourceImage.height = this.height;
        this.selectedBlocks = [];
    }
}

const glob:GlobalData = new GlobalData();

export = glob;
