# Toy Motion Orchestra

An in-browser instrument that translates a moving rhythm toy into new electronic music: **Toy Motion → Color Tracking → Motion Tracking → Rhythm / Coordination Analysis → Generative Music**.

No video or analysis data is sent to a server. Camera processing is performed locally in your browser.

## Use

1. Open the site over HTTPS (GitHub Pages) and choose **CAMERA START**.
2. Point the camera at the toy. The default target is saturated red; use **PICK COLOR**, then tap a colored moving part to calibrate another color.
3. Use **AUTO ASSIGN**, or choose **MANUAL ASSIGN** and tap LEFT STICK, RIGHT STICK, then WHISTLE.
4. Select **AUDIO START** (required by browser audio permission rules), then move the toy.
5. Use **DEMO MODE** to exercise the same tracking, hit, tempo, analysis, graphics, and audio pipeline without a toy.

## Tracking and analysis

Frames are sampled at 320×180 (independent of display resolution) and classified in HSV, which is more tolerant of lighting changes than fixed RGB matching. A compact neighborhood cleanup and connected-component pass remove small regions and extract blobs. Each target is matched against its prior filtered position, initial home region, vertical role, and blob area; positions are EMA-smoothed. The confidence readout is an app-defined continuity/match score, not a MediaPipe confidence.

Drum hits are detected from a sufficiently fast downward movement followed by a rebound, with a 180 ms debounce. Recent valid hit intervals yield left, right, and global BPM. Relative phase uses the instantaneous angle of each stick's position/velocity pair; coordination is a stable, musical closeness score derived from its phase relationship. These are interactive approximations, not research-grade biomechanics measures.

## Sound mapping

- Left hit: kick / bass drum
- Right hit: snare-like noise
- Near-simultaneous hits: crash/accent
- Whistle horizontal movement: scale-quantized lead pitch; motion speed controls activity/level
- Coordination can influence the orchestral harmonic character; toy BPM can drive tempo, or use Manual BPM.

Modes are DRUM, SYNTH, TOY ORCHESTRA, and AMBIENT. “REPLACE TOY SOUND” is embodied by the visible **TOY MOTION ↓ NEW SOUND** mapping: it generates synchronized electronic sound but does not physically remove the toy's acoustic sound.

## Export and recording

**RECORD DATA** stores timestamped target position, velocity, speed, hit status, BPM, phase, coordination, confidence, note/chord, and mode. Export it as CSV or JSON. **VIDEO RECORD** records the composited tracking canvas to WebM when `MediaRecorder` / `captureStream()` are available.

## Browser support and limits

Current Chrome and Safari on desktop/mobile are targeted. Camera and microphone access require HTTPS or localhost and user permission. Safari’s MediaRecorder support varies by version. Red-colored background objects can be falsely detected, and changing illumination may require Color Calibration. Large overlap between the three same-colored parts can temporarily reduce identity confidence.

## Privacy

Camera frames, HSV mask processing, and exported recordings remain on the device unless you choose to download or share an exported file.
