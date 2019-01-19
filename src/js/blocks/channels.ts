import BlockError = require('./../types/BlockError.js');
import Channel = require('./../types/Channel.js');
import Color = require('./../3rdparty/color.js');

const splitChannels = <IBlockTemplate>{
    nameLoc: 'blocks.channels.splitChannels.name',
    name: 'Split Channels',
    noPreview: true,
    inputs: [{
        key: 'pixels',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.channels.splitChannels.input'
    }],
    outputs: [{
        key: 'channel',
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
            const w = inputs.pixels.width,
                  h = inputs.pixels.height;
            const channelR = new Channel(w, h),
                channelG = new Channel(w, h),
                channelB = new Channel(w, h),
                channelA = new Channel(w, h),
                channels = [channelR, channelG, channelB, channelA];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    for (let i = 0; i < 4; i++) {
                        channels[i].data.push(inputs.pixels.data[(x + y*w)*4 + i]);
                    }
                }
            }
            resolve({
                channel: channelR,
                g: channelG,
                b: channelB,
                a: channelA
            });
        });
    }
};

const combineChannels = <IBlockTemplate>{
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
            const orient = inputs.r || inputs.g || inputs.b || inputs.a;
            if (!orient) {
                return reject(new BlockError('At least one input channel must be connected', block));
            }
            const w = orient.width,
                  h = orient.height;
            const out = new ImageData(w, h);
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    const i = x + y*w;
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

const splitHSV = <IBlockTemplate>{
    nameLoc: 'blocks.channels.splitHSV.name',
    name: 'Split to HSV',
    noPreview: true,
    inputs: [{
        key: 'pixels',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.channels.splitHSV.input'
    }],
    outputs: [{
        key: 'h',
        type: 'channel',
        name: 'Hue',
        nameLoc: 'blocks.channels.splitHSV.outputH'
    }, {
        key: 's',
        type: 'channel',
        name: 'Saturation',
        nameLoc: 'blocks.channels.splitHSV.outputS'
    }, {
        key: 'v',
        type: 'channel',
        name: 'Value',
        nameLoc: 'blocks.channels.splitHSV.outputV'
    }, {
        key: 'a',
        type: 'channel',
        name: 'Alpha',
        nameLoc: 'blocks.channels.splitHSV.outputAlpha'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const w = inputs.pixels.width,
                  h = inputs.pixels.height;
            const channelH = new Channel(w, h),
                channelS = new Channel(w, h),
                channelV = new Channel(w, h),
                channelA = new Channel(w, h);
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const pos = x + y*inputs.pixels.width;
                    const color = Color([inputs.pixels.data[pos*4], inputs.pixels.data[pos*4+1], inputs.pixels.data[pos*4+2]]).toHSV();
                    channelH.data[pos] = color.hue / 360 * 256;
                    channelS.data[pos] = color.saturation * 256;
                    channelV.data[pos] = color.value * 256;
                    channelA.data[pos] = inputs.pixels.data[pos*4 + 3];
                }
            }
            resolve({
                h: channelH,
                s: channelS,
                v: channelV,
                a: channelA
            });
        });
    }
};

const combineHSV = <IBlockTemplate>{
    nameLoc: 'blocks.channels.combineHSV.name',
    name: 'Combine HSV',
    noPreview: true,
    inputs: [{
        key: 'h',
        type: 'channel',
        name: 'Hue',
        nameLoc: 'blocks.channels.combineHSV.inputHH'
    }, {
        key: 's',
        type: 'channel',
        name: 'Saturation',
        nameLoc: 'blocks.channels.combineHSV.inputS'
    }, {
        key: 'v',
        type: 'channel',
        name: 'Value',
        nameLoc: 'blocks.channels.combineHSV.inputV'
    }, {
        key: 'a',
        type: 'channel',
        name: 'Alpha',
        nameLoc: 'blocks.channels.combineHSV.inputAlpha',
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
            const w = inputs.h.width,
                  h = inputs.h.height;
            const out = new ImageData(w, h);
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    const i = x + y*w;
                    const color = Color({
                        hue: inputs.h.data[i] / 256 * 360,
                        saturation: inputs.s.data[i] / 256,
                        value: inputs.v.data[i] / 256
                    }).toRGB();
                    out.data[i*4] = color.red * 256;
                    out.data[i*4+1] = color.green * 256;
                    out.data[i*4+2] = color.blue * 256;
                    out.data[i*4+3] = inputs.a? inputs.a.data[i] : 255;
                }
            }
            resolve({
                output: out
            });
        });
    }
};

module.exports = {
    name: 'Channels',
    blocks: {
        splitChannels,
        combineChannels,
        splitHSV,
        combineHSV
    }
};
