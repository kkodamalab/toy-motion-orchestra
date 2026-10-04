/* Remote phone sensor: captures camera media and sends it directly to the host via WebRTC. */
const hostId = new URLSearchParams(location.search).get('host');
const video = document.getElementById('phoneVideo');
const state = document.getElementById('phoneState');
const badge = document.getElementById('phoneBadge');
let peer, connection, call, stream, facing = 'environment', torchOn = false;

function setState(text, connected = false) {
  state.textContent = text;
  badge.textContent = connected ? 'CONNECTED TO HOST' : text;
  badge.classList.toggle('connected', connected);
}

function cameraConstraints() {
  return { audio: false, video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 } } };
}

async function stopCamera() {
  stream?.getTracks().forEach(track => track.stop());
  stream = null;
  video.srcObject = null;
}

function updateCameraButtons() {
  document.getElementById('rearCamera').classList.toggle('active', facing === 'environment');
  document.getElementById('frontCamera').classList.toggle('active', facing === 'user');
}

async function startCamera() {
  if (!hostId) return setState('INVALID QR LINK');
  setState('REQUESTING CAMERA…');
  try {
    await stopCamera();
    stream = await navigator.mediaDevices.getUserMedia(cameraConstraints());
    video.srcObject = stream;
    await video.play();
    connect();
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities?.() || {};
    document.getElementById('torch').hidden = !capabilities.torch;
  } catch (error) {
    setState(`CAMERA ERROR: ${error.name}`);
  }
}

function connect() {
  peer?.destroy();
  setState('CONNECTING…');
  peer = new Peer();
  peer.on('open', () => {
    connection = peer.connect(hostId, { reliable: true });
    connection.on('open', () => {
      setState('CONNECTED', true);
      connection.send({ type: 'camera-state', active: true, label: stream.getVideoTracks()[0]?.label });
      connection.on('data', message => { if (message?.type === 'switch-camera') switchCamera(); });
    });
    call = peer.call(hostId, stream);
    call.on('stream', () => {});
    call.on('close', () => setState('DISCONNECTED'));
    call.on('error', () => setState('DISCONNECTED'));
  });
  peer.on('disconnected', () => setState('DISCONNECTED'));
  peer.on('error', error => setState(`CONNECTION ERROR: ${error.type}`));
}

async function switchCamera(next = facing === 'environment' ? 'user' : 'environment') {
  facing = next;
  updateCameraButtons();
  if (!stream) return;
  const oldStream = stream;
  try {
    const replacement = await navigator.mediaDevices.getUserMedia(cameraConstraints());
    const newTrack = replacement.getVideoTracks()[0];
    const sender = call?.peerConnection?.getSenders().find(item => item.track?.kind === 'video');
    await sender?.replaceTrack(newTrack);
    stream = replacement;
    video.srcObject = replacement;
    oldStream.getTracks().forEach(track => track.stop());
    connection?.send({ type: 'camera-state', active: true, label: newTrack.label });
  } catch (error) {
    stream = oldStream;
    setState(`SWITCH ERROR: ${error.name}`);
  }
}

document.getElementById('phoneStart').onclick = startCamera;
document.getElementById('rearCamera').onclick = () => switchCamera('environment');
document.getElementById('frontCamera').onclick = () => switchCamera('user');
document.getElementById('torch').onclick = async event => {
  const track = stream?.getVideoTracks()[0];
  if (!track) return;
  try {
    torchOn = !torchOn;
    await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    event.currentTarget.textContent = `TORCH ${torchOn ? 'ON' : 'OFF'}`;
  } catch (_) { event.currentTarget.hidden = true; }
};

if (!hostId) setState('INVALID QR LINK');
