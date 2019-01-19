interface IBlockCollection {
    name: string;
    set?: string;
    paletteCount: number;
    blocks: {
        [index: string]: IBlockTemplate;
    };
}

const exp = Array<IBlockCollection>();

require('fs')
.readdirSync('./js/blocks')
.forEach(fileName => {
    if (fileName.match(/\.js$/)) {
        const category:IBlockCollection = require('./blocks/' + fileName);
        category.set = fileName.slice(0, -3);
        let paletteCount = 0;
        for (const key in category.blocks) {
            if (category.blocks.hasOwnProperty(key)) {
                if (!category.blocks[key].noPalette && !category.blocks[key].isSingular) {
                    paletteCount ++;
                }
                category.blocks[key].set = category.set;
            }
        }
        category.paletteCount = paletteCount;
        exp.push(category);
    }
});

export = exp;
