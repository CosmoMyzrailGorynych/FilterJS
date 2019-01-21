// tslint:disable:member-ordering
const fs = require('fs-extra');
const vectorShader = fs.readFileSync('./js/vertexShader.glsl', {
    encoding: 'utf-8'
}),
fragmentTemplate = fs.readFileSync('./js/fragmentShader.glsl', {
    encoding: 'utf-8'
});

const VERT = WebGLRenderingContext.VERTEX_SHADER,
      FRAG = WebGLRenderingContext.FRAGMENT_SHADER;

const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ];
};

class Renderer {
    canvas = document.createElement('canvas');
    private gl: WebGLRenderingContext;
    private vecShader: WebGLShader;
    private fragShader: WebGLShader;
    private program: WebGLProgram;
    private paramNotation: object;
    constructor(fragCode: string, params?: object) {
        this.paramNotation = params || {};
        const gl = this.gl;
        this.canvas.addEventListener('webglcontextlost', e => {
            e.preventDefault();
        }, false);
        this.canvas.addEventListener('webglcontextrestored', this.setup.bind(this, [fragCode, this.paramNotation]), false);
        this.canvas.width = this.canvas.height = 1;
        this.setup(fragCode, this.paramNotation);
        return this;
    }
    setup(fragCode: string, params?: object) {
        this.gl = this.canvas.getContext('webgl2');
        const gl = this.gl;
        this.vecShader = gl.createShader(VERT);
        this.fragShader = gl.createShader(FRAG);
        this.program = gl.createProgram();
        var fragSource = fragmentTemplate;
        fragSource = fragSource.replace('${source}', fragCode);
        var uniformsCode = '';
        params = params || {};
        for (const key in params) {
            if (params[key] === 'number') {
                uniformsCode += `uniform float ${key};\n`;
            } else if (params[key] === 'color') {
                uniformsCode += `uniform vec3 ${key};\n`;
            } else if (params[key] === 'bool') {
                uniformsCode += `uniform bool ${key};\n`;
            }
        }
        fragSource = fragSource.replace('${uniforms}', uniformsCode);
        gl.shaderSource(this.fragShader, fragSource);
        gl.shaderSource(this.vecShader, vectorShader);
        gl.compileShader(this.fragShader);
        gl.compileShader(this.vecShader);
        if (!gl.getShaderParameter(this.fragShader, gl.COMPILE_STATUS) ) {
            console.error(gl.getShaderInfoLog(this.fragShader));
            return null;
        }
        if (!gl.getShaderParameter(this.vecShader, gl.COMPILE_STATUS) ) {
            console.error(gl.getShaderInfoLog(this.vecShader));
            return null;
        }
        gl.attachShader(this.program, this.vecShader);
        gl.attachShader(this.program, this.fragShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.program));
            gl.deleteProgram(this.program);
            return null;
        }
    }
    render(image: HTMLImageElement|HTMLCanvasElement, params?: object, positions?: Array<number>) {
        return new Promise((resolve, reject) => {
            this.canvas.width = image.width;
            this.canvas.height = image.height;
            params = params || {};
            const gl = this.gl;
            const pos = new Float32Array(positions || [
                0, 0,
                image.width, 0,
                0, image.height,
                0, image.height,
                image.width, 0,
                image.width, image.height
            ]);

            const pal = gl.getAttribLocation(this.program, 'a_position');
            // look up where the texture coordinates need to go.
            const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

            const pBuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pBuf);
            gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);

            // provide texture coordinates for the rectangle.
            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0.0,  0.0,
                1.0,  0.0,
                0.0,  1.0,
                0.0,  1.0,
                1.0,  0.0,
                1.0,  1.0
            ]), gl.STATIC_DRAW);

            // Create a texture.
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            // lookup uniforms
            const resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
            const textureSizeLocation = gl.getUniformLocation(this.program, 'u_textureSize');

            // Resize the drawing buffer to fit the source image
            gl.viewport(0, 0, image.width, image.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(this.program);

            gl.enableVertexAttribArray(pal);
            gl.bindBuffer(gl.ARRAY_BUFFER, pBuf);
            gl.vertexAttribPointer(pal, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(texCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(resolutionLocation, image.width, image.height);
            gl.uniform2f(textureSizeLocation, image.width, image.height);

            for (const key in params) {
                if (Object.hasOwnProperty.apply(params, [key])) {
                    const param = params[key];
                    const loc = gl.getUniformLocation(this.program, key);
                    if (typeof param === 'number') {
                        gl.uniform1f(loc, param);
                    } else if (typeof param === 'string') { // a hex-encoded color
                        const [r, g, b] = getRGB(param);
                        gl.uniform3f(loc, r / 256, g / 256, b / 256);
                    }
                    if (typeof param === 'boolean') {
                        gl.uniform1f(loc, param? 1 : 0);
                    }
                }
            }

            gl.finish();

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.finish();

            const dataUrl = this.canvas.toDataURL();
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.src = dataUrl;
        });
    }
}

export = Renderer;
