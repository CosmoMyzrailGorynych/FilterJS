declare enum LinkType {
    Canvas = 'canvas',
    Pixels = 'pixels',
    Color = 'color',
    Number = 'number',
    Channel = 'channel',
    Boolean = 'bool'
}

interface ILinkNotation {
    key: string;
    name: string;
    nameLoc: string;
    type: LinkType;
    optional?: boolean;
    hint?: string;
}

interface ITagNotation {
    key: string;
    tag: string;
    label?: string;
    options?: Array<string>;
    defaultValue: any;
}

interface IBlockTemplate {
    nameLoc: string;
    name: string;
    set?: string;
    key?: string;
    noPreview?: boolean;
    noPalette?: boolean;
    isSingular?: boolean;
    tags?: Array<ITagNotation>;
    hint?: string;
    inputs: Array<ILinkNotation>;
    outputs: Array<ILinkNotation>;
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
    template: IBlockTemplate;
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
