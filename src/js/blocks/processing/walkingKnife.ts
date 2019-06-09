/**
 * idea and algorithm by Comigo
 * this might be completely new to this world, who knows
 */

import OSWebGL = require('../../oneShotWebGL.js');
import BlockError = require('../../types/BlockError.js');
const glsl = e => e;

const walkingKnifeOGLCode = '' + glsl`
    vec2 position = v_texCoord;
    vec4 initial = texture2D(u_image, v_texCoord),
         minimum = texture2D(u_image, v_texCoord),
         maximum = texture2D(u_image, v_texCoord);
    float minimumLuma = luma(minimum),
          maximumLuma = luma(maximum);
    for (int i = 0; i < $maxDistance; i++) {
        vec2 pW = position - pixel*vec2(1.0, 0.0),
             pA = position - pixel*vec2(0.0, 1.0),
             pS = position + pixel*vec2(0.0, 1.0),
             pD = position + pixel*vec2(1.0, 0.0);
        vec4 cW = texture2D(u_image, pW),
                cA = texture2D(u_image, pA),
                cS = texture2D(u_image, pS),
                cD = texture2D(u_image, pD);
        bool descended = false;
        if (luma(cW) < minimumLuma)  {
            minimum = cW;
            position = pW;
            minimumLuma = luma(minimum);
            descended = true;
        }
        if (luma(cA) < minimumLuma)  {
            minimum = cA;
            position = pA;
            minimumLuma = luma(minimum);
            descended = true;
        }
        if (luma(cS) < minimumLuma)  {
            minimum = cS;
            position = pS;
            minimumLuma = luma(minimum);
            descended = true;
        }
        if (luma(cD) < minimumLuma)  {
            minimum = cD;
            position = pD;
            minimumLuma = luma(minimum);
            descended = true;
        }
        if (!descended) {
            break;
        }
    }
    position = v_texCoord;
    for (int i = 0; i < $maxDistance; i++) {
        vec2 pW = position - pixel*vec2(1.0, 0.0),
             pA = position - pixel*vec2(0.0, 1.0),
             pS = position + pixel*vec2(0.0, 1.0),
             pD = position + pixel*vec2(1.0, 0.0);
        vec4 cW = texture2D(u_image, pW),
             cA = texture2D(u_image, pA),
             cS = texture2D(u_image, pS),
             cD = texture2D(u_image, pD);
        bool descended = false;
        
        if (luma(cW) > maximumLuma)  {
            maximum = cW;
            position = pW;
            maximumLuma = luma(maximum);
            descended = true;
        }
        if (luma(cA) > maximumLuma)  {
            maximum = cA;
            position = pA;
            maximumLuma = luma(maximum);
            descended = true;
        }
        if (luma(cS) > maximumLuma)  {
            maximum = cS;
            position = pS;
            maximumLuma = luma(maximum);
            descended = true;
        }
        if (luma(cD) > maximumLuma)  {
            maximum = cD;
            position = pD;
            maximumLuma = luma(maximum);
            descended = true;
        }
        if (!descended) {
            break;
        }
    }
    vec4 threshold = minimum*vec4(percentile, percentile, percentile, 0.5) + maximum*vec4(1.0-percentile, 1.0-percentile, 1.0-percentile, 0.5);
    if (luma(threshold) > luma(initial)) {
        gl_FragColor = minimum;
    } else {
        gl_FragColor = maximum;
    }
`;


const walkingKnife = <IBlockTemplate>{
    nameLoc: 'blocks.processing.walkingKnife.name',
    hint: 'Recovers edges by searching for local minimum and maximum, walking pixel-by-pixel, and choosing either minimum or maximum based on how close they are to the source color. Luma-based.',
    name: 'Walking Knife',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.walkingKnife.input'
    }, {
        key: 'radius',
        type: 'number',
        name: 'Radius',
        hint: 'A number between (0;1], relative to the width of an input image.',
        nameLoc: 'blocks.processing.walkingKnife.radius'
    }, {
        key: 'percentile',
        type: 'number',
        name: 'Percentile',
        optional: true,
        hint: 'A number from 0 (prefer shadows) to 1 (prefer lights). Defaults to 0.5.',
        nameLoc: 'blocks.processing.walkingKnife.percentile'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.composing.walkingKnife.output'
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input,
                  radius = inputs.radius,
                  percentile = inputs.percentile !== void 0? inputs.percentile : 0.5
            var method;
            const shot = walkingKnifeOGLCode.replace(/\$maxDistance/g, Math.floor(inp.width * radius).toString());
            (new OSWebGL(shot, {
                percentile: 'float'
            }, glsl`
                float luma(vec4 color) {
                    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
                }
            `)).render(inp, {
                percentile
            })
            .then(output => {
                resolve({
                    output
                });
            })
            .catch(err => {
                console.error(err);
                reject(new BlockError(err, block));
            });
        });
    }
};

module.exports = {walkingKnife};
