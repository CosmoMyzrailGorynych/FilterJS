import Block = require('./Block.js');

class Link {
    inputKey: string;
    outKey: string;
    inputBlock: Block;
    outBlock: Block;
    constructor(inputBlock, inputKey, outBlock, outKey) {
        this.inputBlock = inputBlock;
        this.inputKey = inputKey;
        this.outBlock = outBlock;
        this.outKey = outKey;
    }
}

export = Link;
