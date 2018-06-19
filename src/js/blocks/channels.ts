import BlockError = require('./../types/BlockError.js');
import Channel = require('./../types/Channel.js');

var splitChannels = <BlockTemplate>{
    nameLoc: 'blocks.channels.splitChannels.name',
    name: 'Split Channels',
    noPreview: true,
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.channels.splitChannels.input'
    }],
    outputs: [{
        key: 'r',
        type: 'channel',
        name: 'Red',
        nameLoc: 'blocks.channels.splitChannels.outputRed'
    }, {
        key: 'g',
        type: 'channel',
        name: 'Green',
        nameLoc: 'blocks.channels.splitChannels.outputGreen'
    }, {
        key: 'b',
        type: 'channel',
        name: 'Blue',
        nameLoc: 'blocks.channels.splitChannels.outputBlue'
    }, {
        key: 'a',
        type: 'channel',
        name: 'Alpha',
        nameLoc: 'blocks.channels.splitChannels.outputAlpha'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            var w = inputs.input.width,
                h = inputs.input.height;
            var channelR = new Channel(w, h), 
                channelG = new Channel(w, h),
                channelB = new Channel(w, h),
                channelA = new Channel(w, h),
                channels = [channelR, channelG, channelB, channelA];
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    for (let i = 0; i < 4; i++) {
                        channels[i].data.push(inputs.input.data[(x + y*w)*4 + i]);
                    }
                }
            }
            resolve({
                r: channelR,
                g: channelG,
                b: channelB,
                a: channelA
            });
        });
    }
};

var combineChannels = <BlockTemplate>{
    nameLoc: 'blocks.channels.combineChannels.name',
    name: 'Combine Channels',
    noPreview: true,
    inputs: [{
        key: 'r',
        type: 'channel',
        name: 'Red',
        nameLoc: 'blocks.channels.combineChannels.inputRed',
        optional: true
    }, {
        key: 'g',
        type: 'channel',
        name: 'Green',
        nameLoc: 'blocks.channels.combineChannels.inputGreen',
        optional: true
    }, {
        key: 'b',
        type: 'channel',
        name: 'Blue',
        nameLoc: 'blocks.channels.combineChannels.inputBlue',
        optional: true
    }, {
        key: 'a',
        type: 'channel',
        name: 'Alpha',
        nameLoc: 'blocks.channels.combineChannels.inputAlpha',
        optional: true
    }],
    outputs: [{
        key: 'output',
        type: 'pixels',
        name: 'Output',
        nameLoc: 'blocks.channels.combineChannels.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            var orient = inputs.r || inputs.g || inputs.b || inputs.a;
            if (!orient) {
                var error = new BlockError('At least one input channel must be connected');
                error.block = block;
                return reject(error);
            }
            var w = orient.width,
                h = orient.height;
            var out = new ImageData(w, h);
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    let i = x + y*w;
                    out.data[i*4] = inputs.r? inputs.r.data[i] : 0;
                    out.data[i*4+1] = inputs.g? inputs.g.data[i] : 0;
                    out.data[i*4+2] = inputs.b? inputs.b.data[i] : 0;
                    out.data[i*4+3] = inputs.a? inputs.a.data[i] : 255;
                }
            }
            resolve({
                output: out
            });
        });
    }
};

export {
    splitChannels,
    combineChannels
};
