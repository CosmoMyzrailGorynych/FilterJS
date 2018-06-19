interface IBlockCollection {
    [index: string]: IBlockTemplate;
}

const exp = <IBlockCollection>{};

require('fs')
.readdirSync('./js/blocks')
.forEach(fileName => {
    if (fileName.match(/\.js$/)) {
        const blocks:IBlockCollection = require('./blocks/' + fileName);
        for (const i in blocks) {
            if (blocks.hasOwnProperty(i)) {
                exp[i] = blocks[i];
                blocks[i].set = fileName.slice(0, -3);
            }
        }
    }
});

export = exp;
