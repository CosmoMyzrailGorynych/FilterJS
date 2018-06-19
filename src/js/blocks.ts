interface BlockCollection {
    [index: string]: BlockTemplate
}

var exp = <BlockCollection>{};

require('fs')
.readdirSync('./js/blocks')
.forEach(fileName => {
    if (fileName.match(/\.js$/)) {
        var blocks:BlockCollection = require('./blocks/' + fileName);
        for (var i in blocks) {
            exp[i] = blocks[i];
            blocks[i].set = fileName.slice(0, -3);
        }
    }
});

export = exp;
