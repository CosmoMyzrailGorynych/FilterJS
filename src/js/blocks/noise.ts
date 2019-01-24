import Noise = require('./../3rdparty/perlin.js');
import Block = require('./../types/Block.js');

const lerp = (a: number, b: number, alpha: number): number => {
    return a*(1-alpha) + b*alpha;
};

const perlinNoise = <IBlockTemplate>{
    nameLoc: 'blocks.noise.perlinNoise.name',
    name: 'Perlin Noise',
    inputs: [{
        key: 'lowestValue',
        type: 'pixels',
        name: 'Lowest value',
        nameLoc: 'blocks.noise.perlinNoise.lowestValue'
    }, {
        key: 'highestValue',
        type: 'pixels',
        name: 'Highest value',
        nameLoc: 'blocks.noise.perlinNoise.highestValue'
    }, {
        key: 'sizeX',
        type: 'number',
        name: 'Size X',
        optional: true,
        nameLoc: 'blocks.noise.perlinNoise.sizeX'
    }, {
        key: 'sizeY',
        type: 'number',
        name: 'Size Y',
        optional: true,
        nameLoc: 'blocks.noise.perlinNoise.sizeY'
    }, {
        key: 'repeat',
        type: 'number',
        name: 'Repeat',
        optional: true,
        nameLoc: 'blocks.noise.perlinNoise.repeat'
    }],
    outputs: [{
        key: 'pixels',
        type: 'pixels',
        name: 'Pixels',
        nameLoc: 'blocks.noise.perlinNoise.outputPixels',
    }],
    tags: [{
        key: 'seed',
        tag: 'number-input',
        defaultValue: 0,
        label: 'Seed:'
    }],
    exec(inputs: any, block: Block) {
        return new Promise((resolve, reject) => {
            const seedSet = Noise.seed(block.tagValues.seed || 0),
                  plainRandom = new (require('mersenne-twister'))(0);
            const sizeX = inputs.sizeX || 5,
                  sizeY = inputs.sizeY || 5;
            var repeat = inputs.repeat || 1;
            repeat = Math.max(1, Math.min(5, repeat));
            const i1 = inputs.lowestValue,
                  i2 = inputs.highestValue,
                  out = document.createElement('canvas').getContext('2d')
                        .createImageData(i1.width, i1.height);
            const shifts = [];
            for (let i = 1; i <= repeat; i++) {
                shifts.push(plainRandom.random() * i1.width);
                shifts.push(plainRandom.random() * i1.width);
            }
            for (let x = 0; x < i1.width; x++) {
                for (let y = 0; y < i1.height; y++) {
                    let a = Noise.perlin2(x / i1.width * sizeX, y / i1.width * sizeY, seedSet);
                    for (let i = 1; i <= repeat; i++) {
                        const randX = shifts[(i-1) * 2 ],
                              randY = shifts[(i-1) * 2 + 1];
                        a = lerp(
                            a,
                            Noise.perlin2((x+randX) / i1.width * sizeX * Math.pow(2, i), (y+randY) / i1.width * sizeY * Math.pow(2, i), seedSet),
                            1 / Math.pow(2, i)
                        );
                    }
                    for (var i = 0; i < 4; i++) {
                        out.data[(y * i1.width + x)*4 + i] = lerp(
                            i1.data[(y * i1.width + x)*4 + i],
                            i2.data[(y * i1.width + x)*4 + i],
                            (a + 1) / 2
                        );
                    }
                }
            }
            resolve({
                pixels: out
            });
        });
    }
};

const simplexNoise = <IBlockTemplate>{
    nameLoc: 'blocks.noise.simplexNoise.name',
    name: 'Simplex Noise',
    inputs: [{
        key: 'lowestValue',
        type: 'pixels',
        name: 'Lowest value',
        nameLoc: 'blocks.noise.simplexNoise.lowestValue'
    }, {
        key: 'highestValue',
        type: 'pixels',
        name: 'Highest value',
        nameLoc: 'blocks.noise.simplexNoise.highestValue'
    }, {
        key: 'sizeX',
        type: 'number',
        name: 'Size X',
        optional: true,
        nameLoc: 'blocks.noise.simplexNoise.sizeX'
    }, {
        key: 'sizeY',
        type: 'number',
        name: 'Size Y',
        optional: true,
        nameLoc: 'blocks.noise.simplexNoise.sizeY'
    }, {
        key: 'repeat',
        type: 'number',
        name: 'Repeat',
        optional: true,
        nameLoc: 'blocks.noise.simplexNoise.repeat'
    }],
    outputs: [{
        key: 'pixels',
        type: 'pixels',
        name: 'Pixels',
        nameLoc: 'blocks.noise.simplexNoise.outputPixels',
    }],
    tags: [{
        key: 'seed',
        tag: 'number-input',
        defaultValue: 0,
        label: 'Seed:'
    }],
    exec(inputs: any, block: Block) {
        return new Promise((resolve, reject) => {
            const seedSet = Noise.seed(block.tagValues.seed || 0),
                  plainRandom = new (require('mersenne-twister'))(0);
            const sizeX = inputs.sizeX || 5,
                  sizeY = inputs.sizeY || 5;
            var repeat = inputs.repeat || 1;
            repeat = Math.max(1, Math.min(5, repeat));
            const i1 = inputs.lowestValue,
                  i2 = inputs.highestValue,
                  out = document.createElement('canvas').getContext('2d')
                        .createImageData(i1.width, i1.height);
            const shifts = [];
            for (let i = 1; i <= repeat; i++) {
                shifts.push(plainRandom.random() * i1.width);
                shifts.push(plainRandom.random() * i1.width);
            }
            for (let x = 0; x < i1.width; x++) {
                for (let y = 0; y < i1.height; y++) {
                    let a = Noise.simplex2(x / i1.width * sizeX, y / i1.width * sizeY, seedSet);
                    for (let i = 1; i <= repeat; i++) {
                        const randX = shifts[(i-1) * 2 ],
                              randY = shifts[(i-1) * 2 + 1];
                        a = lerp(
                            a,
                            Noise.simplex2((x+randX) / i1.width * sizeX * Math.pow(2, i), (y+randY) / i1.width * sizeY * Math.pow(2, i), seedSet),
                            1 / Math.pow(2, i)
                        );
                    }
                    for (var i = 0; i < 4; i++) {
                        out.data[(y * i1.width + x)*4 + i] = lerp(
                            i1.data[(y * i1.width + x)*4 + i],
                            i2.data[(y * i1.width + x)*4 + i],
                            (a + 1) / 2
                        );
                    }
                }
            }
            resolve({
                pixels: out
            });
        });
    }
};

module.exports = {
    name: 'Noise',
    blocks: {
        perlinNoise,
        simplexNoise
    }
};
