/*tslint:disable:interface-name*/
interface HTMLCanvasElement {
  getContext(contextId: 'webgl2' | 'experimental-webgl2', contextAttributes?: WebGLContextAttributes): WebGLRenderingContext | null;
}
