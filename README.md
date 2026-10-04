# Toy Motion Orchestra

An in-browser **Color → Motion → Sound** instrument. It tracks independently configurable colored targets from this device's camera or a QR-connected phone camera, analyzes movement and rhythm, and generates sound. Color analysis and music processing run in the host browser.

## Camera sources

### This device

1. Select **THIS DEVICE**, then **CAMERA START**.
2. Allow camera access. **CAMERA SWITCH** changes the local facing mode.

### Remote phone

1. On the host, select **REMOTE PHONE**. A QR code is created.
2. Scan it on the phone and open the repository's `phone.html` page.
3. Tap **START CAMERA** and allow camera access. The rear camera is selected by default.
4. The phone sends its `MediaStream` to the host over WebRTC. The received stream is assigned to the same video element used by local capture, so eyedropper sampling, masks, blob tracking, hit detection, BPM, phase, coordination, recording, and sound use the unchanged analysis pipeline.
5. Switch between rear/front cameras on the phone, or use **SWITCH PHONE CAMERA** on the host. If the phone disconnects, tracking pauses and the host does not silently fall back to its own camera.

**VIDEO FIT** defaults to **CONTAIN**, preserving the camera's native aspect ratio with black letterbox or pillarbox space when needed. **COVER** fills the stage by cropping overflow, never by stretching. Both local and remote cameras use the same aspect-aware video, mask, marker, trail, bounding-box, and eyedropper coordinate transforms. Portrait streams are analyzed at 180×320, standard landscape streams at 320×180, and unusual aspect ratios retain their source ratio. The layout is recalculated from `videoWidth` and `videoHeight`, including after phone rotation.

The phone link contains a temporary PeerJS host ID. The public, API-key-free PeerJS cloud broker performs signaling; QR alone cannot negotiate WebRTC. Camera media is sent peer-to-peer and is not uploaded to the signaling service. This keeps the project deployable as static GitHub Pages files, but initial connection requires internet access to the signaling broker. No paid account or project API key is required. Network policies or symmetric NAT may prevent a direct connection because this app deliberately does not configure a paid TURN relay.

## Color targets

Three red presets—LEFT STICK, RIGHT STICK, and WHISTLE—are provided initially. Every target has an editable name, arbitrary HTML color picker, quick presets, independent HSV tolerances, and an **EYEDROPPER**. The eyedropper takes a robust 11×11 camera sample and estimates initial tolerances. Targets and color profiles persist in `localStorage`; more targets can be added.

Frames from either camera source are reduced to 320×180, classified per target in HSV, cleaned, and converted to blobs. Assignment combines color eligibility with predicted position, velocity continuity, initial position, and blob area, allowing distinct colors as well as multiple similarly colored objects.

## Hosting and browser requirements

Serve the files over HTTPS (including GitHub Pages) or localhost. Camera access and WebRTC do not work from an insecure remote HTTP origin. The default deployment paths are:

- Host: `https://kkodamalab.github.io/toy-motion-orchestra/`
- Phone: `https://kkodamalab.github.io/toy-motion-orchestra/phone.html?host=TEMPORARY_PEER_ID`

The pages load PeerJS 1.5.5 and QRCode.js 1.0.0 from public CDNs. If those scripts are blocked, local-camera tracking remains available but remote pairing does not.

## Privacy

Camera processing is performed locally. Remote video is sent over a WebRTC peer connection and is not intentionally recorded or uploaded unless recording is explicitly enabled. Exported CSV, JSON, and WebM files are created only on user request.
