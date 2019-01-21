import OSWebGL = require('./../../oneShotWebGL.js');
import BlockError = require('./../../types/BlockError.js');
const glsl = e => e;

const gaussianBlurOGL = new OSWebGL(glsl`
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);

    const int kernelSize = 10;
    const int kernelDoubled = kernelSize * 2 + 1;
    float kernel[kernelDoubled];

    float sigma = 7.0;
    float Z = 0.0;
    for (int i = 0; i < kernelSize; ++i) {
        kernel[kernelSize + i] = kernel[kernelSize - i] = 0.39894*exp(-0.5*float(i)*float(i) / (sigma*sigma)) / sigma;
    }

    for (int i = 0; i < kernelDoubled; ++i) {
        Z += kernel[i];
    }

    for (int i = -kernelSize; i <= kernelSize; ++i) {
        for (int j = -kernelSize; j <= kernelSize; ++j) {
            gl_FragColor += kernel[kernelSize + i] * kernel[kernelSize + j] *
                            texture2D(u_image, v_texCoord + vec2(float(i) * size / float(kernelSize), float(j) * size / float(kernelSize)));
        }
    }
    gl_FragColor /= Z*Z;
`, {
    size: 'number'
});
const gaussianBlur = <IBlockTemplate>{
    nameLoc: 'blocks.processing.gaussianBlur.name',
    name: 'Gaussian Blur',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.gaussianBlur.input'
    }, {
        key: 'size',
        type: 'number',
        name: 'Size',
        hint: 'A number between [0; 1), and usually less than 0.1.',
        nameLoc: 'blocks.processing.gaussianBlur.size'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.gaussianBlur.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  {size} = inputs;
            gaussianBlurOGL.render(inp, {
                size
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
    gaussianBlur
};
