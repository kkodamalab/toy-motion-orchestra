const assert = require('node:assert/strict');
const layout = require('../video-layout.js');

assert.deepEqual(layout.analysisSize(1920, 1080), { width: 320, height: 180 });
assert.deepEqual(layout.analysisSize(1080, 1920), { width: 180, height: 320 });
assert.deepEqual(layout.analysisSize(1000, 1000), { width: 320, height: 320 });

const portraitContain = layout.calculate(1600, 900, 1080, 1920, 'contain');
assert.deepEqual(portraitContain, { x: 546.875, y: 0, width: 506.25, height: 900, videoWidth: 1080, videoHeight: 1920, fit: 'contain' });
assert.equal(layout.canvasToVideo(100, 450, portraitContain), null, 'black pillarbox must not map to video');
assert.deepEqual(layout.canvasToVideo(800, 450, portraitContain), { x: 0.5, y: 0.5 });
assert.deepEqual(layout.videoToCanvas(0.5, 0.5, portraitContain), { x: 800, y: 450 });

const portraitCover = layout.calculate(1600, 900, 1080, 1920, 'cover');
assert.equal(portraitCover.width, 1600);
assert.ok(portraitCover.y < 0, 'cover should crop vertically without stretching');
assert.deepEqual(layout.canvasToVideo(800, 450, portraitCover), { x: 0.5, y: 0.5 });

const landscape = layout.calculate(1600, 900, 1920, 1080, 'contain');
assert.deepEqual(landscape, { x: 0, y: 0, width: 1600, height: 900, videoWidth: 1920, videoHeight: 1080, fit: 'contain' });
console.log('video layout tests passed');
