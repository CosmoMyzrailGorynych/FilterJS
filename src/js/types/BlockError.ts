class BlockError extends Error {
    block: Block;
    constructor(message: string, block: Block) {
        super(message);
        this.block = block;
        console.error(this);
        // tslint:disable-next-line: no-console
        console.trace();
    }
}

export = BlockError;
