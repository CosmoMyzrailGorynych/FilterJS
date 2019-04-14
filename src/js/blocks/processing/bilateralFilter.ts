import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('../../types/BlockError.js');
const glsl = e => e;

/*
MIT License

Copyright (c) 2017 Tran Van Sang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
const OGLCode = '' + glsl`
    float facS = -1.0 / (sigS*sigS);
    float facL = -1.0 / (sigL*sigL);

    float sumW = 0.0;
    vec4  sumC = vec4(0.0);

    float l = length(texture2D(u_image, v_texCoord).xyz);

    for (int x = -$halfSize; x <= $halfSize; x++) {
        for (int y = -$halfSize; y <= $halfSize; y++) {
            vec2 pos = vec2(float(x), float(y));
            vec4 offsetColor = texture2D(u_image, v_texCoord + pos * pixel);

            float distS = length(pos);
            float distL = length(offsetColor.xyz)-l;

            float wS = exp(facS * float(distS*distS));
            float wL = exp(facL * float(distL*distL));
            float w = wS*wL;

            sumW += w;
            sumC += offsetColor * w;
        }
    }

    gl_FragColor = sumC/sumW;
`;

const bilateralFilter = <IBlockTemplate>{
    nameLoc: 'blocks.processing.bilateralFilter.name',
    name: 'Smart blur',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.bilateralFilter.input'
    }, {
        key: 'size',
        type: 'number',
        name: 'Radius',
        hint: 'The size of the kernel relative to the image. Should be less than 1, usually something around 0,01.',
        nameLoc: 'blocks.processing.bilateralFilter.size'
    }, {
        key: 'threshold',
        type: 'number',
        name: 'Threshold',
        hint: '',
        nameLoc: 'blocks.processing.bilateralFilter.threshold'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.bilateralFilter.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  {size} = inputs;
            const pixels = Math.floor(size / 2 * inp.width);
            const shot = OGLCode.replace(/\$halfSize/g, pixels.toString());
            (new OSWebGL(shot, {
                sigS: 'float',
                sigL: 'float'
            })).render(inp, {
                sigS: pixels,
                sigL: inputs.threshold
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

module.exports = {
    bilateralFilter
};
