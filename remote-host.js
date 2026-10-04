/* WebRTC host adapter. PeerJS is used only for signaling; camera media is peer-to-peer. */
window.RemoteCameraHost = (() => {
  let peer = null;
  let mediaCall = null;
  let control = null;
  let enabled = false;

  const status = (state, detail = '') => {
    const el = document.getElementById('phoneStatus');
    if (el) {
      el.dataset.state = state.toLowerCase();
      el.textContent = `PHONE CAMERA · ${state}${detail ? ` · ${detail}` : ''}`;
    }
  };

  const phonePageUrl = id => {
    const url = new URL('phone.html', document.baseURI);
    url.searchParams.set('host', id);
    return url.href;
  };

  const showQr = id => {
    const url = phonePageUrl(id);
    const target = document.getElementById('qrCode');
    target.replaceChildren();
    if (window.QRCode) new QRCode(target, { text: url, width: 224, height: 224, correctLevel: QRCode.CorrectLevel.M });
    else target.textContent = 'QR library unavailable — open the link below.';
    const link = document.getElementById('phoneUrl');
    link.href = url;
    link.textContent = url;
  };

  const handleDisconnect = () => {
    if (!enabled) return;
    status('DISCONNECTED');
    document.getElementById('phoneConnect')?.classList.remove('connected');
    window.onRemoteCameraLost?.();
  };

  const createPeer = () => {
    if (!window.Peer) {
      status('SIGNALING UNAVAILABLE');
      return;
    }
    peer?.destroy();
    peer = new Peer();
    status('CONNECTING…');
    peer.on('open', id => {
      showQr(id);
      status('WAITING…');
    });
    peer.on('connection', connection => {
      control?.close();
      control = connection;
      control.on('open', () => status('CONNECTING…'));
      control.on('data', message => {
        if (message?.type === 'camera-state') status(message.active ? 'CONNECTED' : 'CONNECTING…', message.label || '');
      });
      control.on('close', handleDisconnect);
    });
    peer.on('call', call => {
      mediaCall?.close();
      mediaCall = call;
      call.answer();
      call.on('stream', stream => {
        if (!enabled) return call.close();
        document.getElementById('phoneConnect')?.classList.add('connected');
        status('CONNECTED');
        window.useRemoteCameraStream?.(stream);
      });
      call.on('close', handleDisconnect);
      call.on('error', handleDisconnect);
    });
    peer.on('disconnected', handleDisconnect);
    peer.on('error', error => status('ERROR', error.type || 'signaling'));
  };

  return {
    start() { enabled = true; createPeer(); },
    stop() {
      enabled = false;
      mediaCall?.close(); control?.close(); peer?.destroy();
      mediaCall = control = peer = null;
    },
    reconnect() { enabled = true; createPeer(); },
    switchCamera() { if (control?.open) control.send({ type: 'switch-camera' }); },
  };
})();
