import blocks = require('./../blocks.js');
import Link = require('./Link.js');
import BlockError = require('./BlockError.js');

class Block {
    template: IBlockTemplate;
    x: number = 0;
    y: number = 0;
    tag: object;
    tagValues: any = {};
    inputLinks: Array<Link> = [];
    values: any = {};
    id: number;

    constructor(key: string, x = 0, y = 0) {
        this.template = blocks[key];
        this.x = x;
        this.y = y;
        if (this.template.tags) {
            for (const tagInfo of this.template.tags) {
                this.tagValues[tagInfo.key] = tagInfo.defaultValue;
            }
        }
    }
    addLink(inputKey: string, outBlock: Block, outKey: string) {
        this.inputLinks.push(new Link(this, inputKey, outBlock, outKey));
    }
    exec(): Promise<any> {
        if (Object.keys(this.values).length) {
            return Promise.resolve(this.values);
        }

        if (this.template.inputs.find(input => {
            return !input.optional && !this.inputLinks.find(link =>
                link.inputKey === input.key
            );
        })) {
            return Promise.reject(new BlockError('Not all the required inputs were provided', this));
        }

        const inputs = {};

        const promises = this.inputLinks.map(link => link.outBlock.exec()
            .then(results => {
                inputs[link.inputKey] = link.outBlock.values[link.outKey];
            })
        );

        return Promise.all(promises)
        .then(() => this.template.exec(inputs, this))
        .then(results => {
            for (const i in results) {
                if (results.hasOwnProperty(i)) {
                    this.values[i] = results[i];
                }
            }
            return Promise.resolve(results);
        });
    }
}

export = Block;
