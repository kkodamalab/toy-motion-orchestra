/* Aspect-ratio-safe transforms shared by local and remote camera rendering. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VideoLayout = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  function calculate(canvasWidth, canvasHeight, videoWidth, videoHeight, fit = 'contain') {
    if (!(canvasWidth > 0 && canvasHeight > 0 && videoWidth > 0 && videoHeight > 0)) throw new RangeError('Layout dimensions must be positive');
    const scale = (fit === 'cover' ? Math.max : Math.min)(canvasWidth / videoWidth, canvasHeight / videoHeight);
    const width = videoWidth * scale;
    const height = videoHeight * scale;
    return { x: (canvasWidth - width) / 2, y: (canvasHeight - height) / 2, width, height, videoWidth, videoHeight, fit };
  }
  function analysisSize(videoWidth, videoHeight, maxDimension = 320) {
    return videoWidth >= videoHeight
      ? { width: maxDimension, height: Math.max(1, Math.round(maxDimension * videoHeight / videoWidth)) }
      : { width: Math.max(1, Math.round(maxDimension * videoWidth / videoHeight)), height: maxDimension };
  }
  function videoToCanvas(x, y, layout) {
    return { x: layout.x + x * layout.width, y: layout.y + y * layout.height };
  }
  function canvasToVideo(x, y, layout) {
    const vx = (x - layout.x) / layout.width;
    const vy = (y - layout.y) / layout.height;
    return vx < 0 || vx > 1 || vy < 0 || vy > 1 ? null : { x: vx, y: vy };
  }
  return { calculate, analysisSize, videoToCanvas, canvasToVideo };
});
