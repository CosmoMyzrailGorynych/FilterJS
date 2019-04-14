import OSWebGL = require('../../oneShotWebGL.js');
import BlockError = require('../../types/BlockError.js');
const glsl = e => e;

const OGLCode = '' + glsl`
    vec4 v = texture2D(u_image, v_texCoord);
    int kernelSize = ($halfSize*2 + 1)*($halfSize*2 + 1);
    const int startInd = -$halfSize;

    vec4 meanColor = vec4(0.0, 0.0, 0.0, 0.0);

    for (int y = startInd; y <= $halfSize; y++) {
        for (int x = startInd; x <= $halfSize; x++) {
            vec4 v1 = texture2D(u_image, v_texCoord + vec2(x, y) * pixel);
            vec4 v2 = texture2D(u_image, v_texCoord + vec2(-x, -y) * pixel);
            vec4 d1 = abs(v - v1);
            vec4 d2 = abs(v - v2);
            vec4 rv = vec4(((d1[0] < d2[0]) ? v1[0] : v2[0]),
                            ((d1[1] < d2[1]) ? v1[1] : v2[1]),
                            ((d1[2] < d2[2]) ? v1[2] : v2[2]),1);
            meanColor += rv;
        }
    }
    gl_FragColor = meanColor / float(kernelSize);
`;

const nearestNeighbor = <IBlockTemplate>{
    nameLoc: 'blocks.processing.nearestNeighbor.name',
    name: 'Nearest neighbor filter',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.nearestNeighbor.input'
    }, {
        key: 'size',
        type: 'number',
        name: 'Size',
        hint: 'A number of kernel in pixels. Should be 2 or more.',
        nameLoc: 'blocks.processing.nearestNeighbor.size'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.nearestNeighbor.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  {size} = inputs;
            const shot = OGLCode.replace(/\$halfSize/g, Math.floor(size / 2).toString());
            (new OSWebGL(shot, {
                iterations: 'int'
            })).render(inp)
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
    nearestNeighbor
};
