declare enum LinkType {
    Canvas = 'canvas',
    Pixels = 'pixels',
    Color = 'color',
    Number = 'number',
    Channel = 'channel',
    Boolean = 'bool'
}

interface LinkNotation {
    key: string;
    name: string;
    nameLoc: string;
    type: LinkType;
    optional?: boolean;
    hint?: string;
}

interface tagNotation {
    key: string,
    tag: string,
    label?: string,
    defaultValue: any
}

interface BlockTemplate {
    nameLoc: string;
    name: string;
    set?: string;
    noPreview?: boolean;
    noPalette?: boolean;
    tags?: Array<tagNotation>;
    hint?: string;
    inputs: Array<LinkNotation>;
    outputs: Array<LinkNotation>;
    exec(inputs: any, block: Block): Promise<object>;
}

declare class Link {
    inputKey: string;
    outKey: string;
    inputBlock: Block;
    outBlock: Block;
    constructor(inputBlock: Block, inputKey: string, outBlock: Block, outKey: string);
}

declare class Block {
    template: BlockTemplate;
    x: number;
    y: number;
    tag: object;
    tagValues: any;
    inputLinks: Array<Link>;
    values: any;
    id: number;
    constructor(key: string, x: number, y: number);
    addLink(inputKey: string, outBlock: Block, outKey: string);
    exec(): Promise<any>;
}