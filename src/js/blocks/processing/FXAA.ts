import BlockError = require('./../../types/BlockError.js');
import OSWebGL = require('./../../oneShotWebGL.js');
const glsl = e => e;

/* Basic FXAA implementation based on the code on geeks3d.com with the
modification that the texture2DLod stuff was removed since it's
unsupported by WebGL. 
https://github.com/mitsuhiko/webgl-meincraft/ */
const FXAAOGL = new OSWebGL(glsl`
    vec4 color;
    vec3 rgbNW = texture2D(u_image, (v_texCoord + vec2(-1.0, -1.0) * pixel)).xyz;
    vec3 rgbNE = texture2D(u_image, (v_texCoord + vec2(1.0, -1.0) * pixel)).xyz;
    vec3 rgbSW = texture2D(u_image, (v_texCoord + vec2(-1.0, 1.0) * pixel)).xyz;
    vec3 rgbSE = texture2D(u_image, (v_texCoord + vec2(1.0, 1.0) * pixel)).xyz;
    vec3 rgbM  = texture2D(u_image, v_texCoord).xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    
    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    
    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
    
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
              dir * rcpDirMin)) * pixel;
      
    vec3 rgbA = 0.5 * (
        texture2D(u_image, v_texCoord + dir * (1.0 / 3.0 - 0.5)).xyz +
        texture2D(u_image, v_texCoord + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture2D(u_image, v_texCoord + dir * -0.5).xyz +
        texture2D(u_image, v_texCoord + dir * 0.5).xyz);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA, 1.0);
    else
        color = vec4(rgbB, 1.0);
    gl_FragColor.rgb = color.rgb;
    gl_FragColor.a = texture2D(u_image, v_texCoord).a;
`, {}, glsl`
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
    #define FXAA_SPAN_MAX     8.0
`);

const FXAA = <IBlockTemplate>{
    nameLoc: 'blocks.processing.FXAA.name',
    name: 'FXAA',
    hint: 'Fast Approximate Anti-Aliasing',
    inputs: [{
        key: 'input',
        type: 'canvas',
        name: 'Input',
        nameLoc: 'blocks.processing.FXAA.input'
    }],
    outputs: [{
        key: 'output',
        type: 'canvas',
        name: 'Output',
        nameLoc: 'blocks.processing.FXAA.output',
    }],
    exec(inputs, block) {
        return new Promise((resolve, reject) => {
            const inp = inputs.input;
            FXAAOGL.render(inp)
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

module.exports = {FXAA};