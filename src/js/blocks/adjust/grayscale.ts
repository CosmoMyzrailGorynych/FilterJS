import Channel = require('./../../types/Channel.js');
import BlockError = require('./../../types/BlockError.js');
import OSWebGL = require('./../../oneShotWebGL.js');
const glsl = e => e;

const grayscaleOGL = new OSWebGL(glsl`
    gl_FragColor = texture2D(u_image, v_texCoord);
    float luma;
    if (calcLuminescence) {
        luma = 0.2126 * gl_FragColor.r + 0.7152 * gl_FragColor.g + 0.0722 * gl_FragColor.b;
    } else {
        luma = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;
    }
    gl_FragColor = vec4(luma, luma, luma, gl_FragColor.a);
`, {
    calcLuminescence: 'bool'
});
const grayscale = <IBlockTemplate>{
    nameLoc: 'blocks.processing.grayscale.name',
    name: 'To Grayscale',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.grayscale.input'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.grayscale.output',
    }],
    tags: [{
        key: 'calcLuminescence',
        defaultValue: true,
        tag: 'bool-input',
        label: 'Use Luminescence'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  {calcLuminescence} = block.tagValues;
            grayscaleOGL.render(inp, {
                calcLuminescence
            })
            .then(image => {
                resolve({
                    output: image
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

const grayscaleChannel = <IBlockTemplate>{
    nameLoc: 'blocks.processing.grayscaleChannel.name',
    name: 'To Grayscale Channel',
    inputs: [{
        key: 'input',
        type: 'pixels',
        name: 'Input',
        nameLoc: 'blocks.processing.grayscale.input'
    }],
    outputs: [{
        key: 'output',
        type: 'channel',
        name: 'Output',
        nameLoc: 'blocks.processing.grayscale.output',
    }],
    tags: [{
        key: 'calcLuminescence',
        defaultValue: true,
        tag: 'bool-input',
        label: 'Use Luminescence'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  out = new Channel(inp.width, inp.height);
            if (block.tagValues.calcLuminescence) {
                for (let x = 0; x < inp.width; x++) {
                    for (let y = 0; y < inp.height; y++) {
                        const p = (y*inp.width + x) * 4,
                              a = 0.2126*inp.data[p] + 0.7152*inp.data[p+1] + 0.0722*inp.data[p+2];
                        out.data[y*inp.width + x] = a;
                    }
                }
            } else {
                for (let x = 0; x < inp.width; x++) {
                    for (let y = 0; y < inp.height; y++) {
                        const p = (y*inp.width + x)*4,
                              a = (inp.data[p] + inp.data[p+1] + inp.data[p+2]) / 3;
                        out.data[y*inp.width + x] = a;
                    }
                }
            }
            resolve({
                output: out
            });
        });
    }
};

module.exports = {grayscale, grayscaleChannel};