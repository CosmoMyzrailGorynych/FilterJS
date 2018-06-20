class BlockError extends Error {
    block: Block;
    constructor(message: string, block: Block) {
        super(message);
        this.block = block;
    }
}

export = BlockError;
