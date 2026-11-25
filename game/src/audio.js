// Copper Ladle Kitchen — WebAudio synth sounds. No audio files, no network.
// All sounds are generated with oscillators / filtered noise. Audio only
// starts after the first user gesture (ensureAudio is called from input).

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    } catch (e) { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(m) { muted = !!m; }
export function isMuted() { return muted; }

function tone(freq, dur, type = 'sine', vol = 0.18, when = 0, slideTo = null) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol = 0.25, freq = 1800, when = 0) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = freq;
  filt.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt).connect(g).connect(ctx.destination);
  src.start(t0);
}

export function playChop() { noiseBurst(0.09, 0.3, 2200); }
export function playDing() { tone(880, 0.18, 'sine', 0.16); tone(1318, 0.22, 'sine', 0.1, 0.05); }
export function playBuzz() { tone(140, 0.25, 'sawtooth', 0.14, 0, 90); }
export function playServe() {
  tone(523, 0.14, 'triangle', 0.18);
  tone(659, 0.14, 'triangle', 0.18, 0.09);
  tone(784, 0.22, 'triangle', 0.2, 0.18);
  tone(1046, 0.3, 'sine', 0.14, 0.27);
}
export function playTick() { tone(1200, 0.05, 'square', 0.07); }
export function playPop() { tone(660, 0.1, 'sine', 0.12, 0, 990); }
