import Block = require('./Block.js');
import blocks = require('./../blocks.js');

const findKeyFromTemplate = (template: IBlockTemplate): string|number => {
    for (const cat of blocks) {
        for (const i in cat.blocks) {
            if (cat.blocks[i] === template) {
                return i;
            }
        }
    }
    return -1;
};

interface ISavedFilter {
    name: string;
    graph: Array<{
        id: number;
        x: number;
        y: number;
        inputLinks: Array<{
            inputKey: string;
            outBlock: number;
            outKey: string;
        }>;
        template: string;
        tagValues: {
            [index: string]: any
        }
    }>;
    view: {
        x: number;
        y: number;
    };
    lastId: number;
    seed: number;
}

class Filter {
    private lastId: number = 0;
    name: string = 'Unnamed Filter';
    graph: Array<Block> = [];
    seed: number = 0;
    view: {
        x: number;
        y: number;
    };
    constructor(name) {
        this.name = name;
        this.view = {
            x: 0,
            y: 0
        };
        const output = this.addBlock('outputImage', 200, -40),
              input = this.addBlock('inputImage', -200, 40);
        output.addLink('image', input, 'image');

        this.exec = () => output.exec()
        .catch(err => {
            console.error(err);
            console.trace();
        });
    }
    addBlock(templateKey, x = 0, y = 0) {
        const block = new Block(templateKey, x, y);
        block.id = this.lastId;
        this.graph.push(block);
        this.lastId++;
        return block;
    }
    cleanUp() {
        for (const block of this.graph) {
            block.values = {};
        }
    }
    exec?(): Promise<any>;
    toJSON(): string {
        const filter = <ISavedFilter>{
            name: this.name,
            graph: this.graph.map(block => ({
                id: block.id,
                inputLinks: block.inputLinks.map(link => ({
                    inputKey: link.inputKey,
                    outBlock: link.outBlock.id,
                    outKey: link.outKey
                })),
                x: block.x,
                y: block.y,
                template: findKeyFromTemplate(block.template),
                tagValues: block.tagValues,
            })),
            view: this.view,
            lastId: this.lastId,
            seed: this.seed
        };
        return JSON.stringify(filter, null, 2);
    }
    fromJSON(json: string): void {
        if (this.graph.length > 2) {
            throw new Error('Trying to load a JSON filter to a non-empty graph is prohibited.');
        }
        this.graph.length = 0;
        try {
            const filter:ISavedFilter = JSON.parse(json),
                blocks = {},
                realBlocks:{
                    [index: number]: Block
                } = {};
            this.view = filter.view;
            this.seed = filter.seed;
            this.name = filter.name;
            for (let i = 0, l = filter.graph.length; i < l; i++) {
                const b = filter.graph[i];
                blocks[b.id] = b;
                const rb = this.addBlock(b.template, b.x, b.y);
                realBlocks[b.id] = rb;
                rb.id = b.id;
                rb.tagValues = b.tagValues;
            }
            for (let i = 0, l = filter.graph.length; i < l; i++) {
                const b = filter.graph[i],
                    rb = realBlocks[b.id];
                for (const link of b.inputLinks) {
                    rb.addLink(link.inputKey, realBlocks[link.outBlock], link.outKey);
                }
            }
            this.lastId = filter.lastId;
            const output = this.graph[0];
            this.exec = () => output.exec();
        } catch (e) {
            throw e;
        }
    }
}

export = Filter;
