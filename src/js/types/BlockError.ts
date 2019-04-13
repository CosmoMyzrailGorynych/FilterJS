class BlockError extends Error {
    block: Block;
    constructor(message: string, block: Block) {
        super(message);
        this.block = block;
        console.error(this);
        console.trace();
    }
}

export = BlockError;
