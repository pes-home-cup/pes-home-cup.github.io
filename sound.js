// Original synthesized event sounds. No external audio files or network dependency.
class HomeCupSound {
  constructor() {
    this.enabled = true;
    try { this.enabled = localStorage.getItem('home-cup-sound') !== 'off'; } catch {}
    this.context = null;
    this.sources = new Set();
    this.events = [];
  }
  async unlock() {
    if (!this.enabled) return false;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return false;
      if (!this.context) {
        this.context = new Context();
        this.master = this.context.createGain();
        this.master.gain.value = .38;
        const compressor = this.context.createDynamicsCompressor();
        this.master.connect(compressor); compressor.connect(this.context.destination);
        this.noise = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      await this.context.resume();
      document.body.dataset.audioReady = String(this.context.state === 'running');
      return this.context.state === 'running';
    } catch { return false; }
  }
  toggle() {
    this.enabled = !this.enabled;
    try { localStorage.setItem('home-cup-sound', this.enabled ? 'on' : 'off'); } catch {}
    if (!this.enabled) {
      for (const source of this.sources) { try { source.stop(); } catch {} }
      this.sources.clear();
    }
    return this.enabled;
  }
  track(source, nodes) {
    this.sources.add(source);
    source.onended = () => { this.sources.delete(source); for (const node of [source, ...nodes]) node.disconnect(); };
  }
  tone(frequency, duration, volume = .2, delay = 0, type = 'sine', endFrequency) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const at = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator(), gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, at);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(volume, at + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain); gain.connect(this.master); this.track(oscillator, [gain]);
    oscillator.start(at); oscillator.stop(at + duration + .02);
  }
  air(duration, volume = .3, delay = 0, rising = true) {
    if (!this.enabled || this.context?.state !== 'running') return;
    const at = this.context.currentTime + delay;
    const source = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain();
    source.buffer = this.noise; filter.type = 'bandpass'; filter.Q.value = .7;
    filter.frequency.setValueAtTime(rising ? 250 : 4000, at);
    filter.frequency.exponentialRampToValueAtTime(rising ? 6000 : 350, at + duration);
    gain.gain.setValueAtTime(.0001, at); gain.gain.linearRampToValueAtTime(volume, at + duration * .55);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    source.connect(filter); filter.connect(gain); gain.connect(this.master); this.track(source, [filter, gain]);
    source.start(at); source.stop(at + duration + .02);
  }
  play(event) {
    if (!this.enabled || this.context?.state !== 'running') return;
    this.events.push(event); if (this.events.length > 150) this.events.shift();
    if (event === 'tick') this.tone(980, .025, .09, 0, 'triangle', 620);
    if (event === 'whoosh') this.air(.65, .28);
    if (event === 'lock') { this.tone(120, .22, .52, 0, 'sine', 48); this.tone(880, .15, .18); this.tone(1320, .22, .13, .08); }
    if (event === 'pair') { this.tone(65, .42, .46); [392, 494, 587].forEach((f, i) => this.tone(f, .7, .12, i * .08, 'triangle')); this.air(.4, .15); }
    if (event === 'reveal') { this.tone(70, .6, .6, 0, 'sine', 35); this.air(1.2, .35, 0, false); [392, 494, 587, 784].forEach((f, i) => this.tone(f, 1.2, .16, i * .09, 'triangle')); }
    if (event === 'champion') { this.tone(65, .9, .45, 0, 'sine', 32); this.air(1.5, .2, 0, false); [392, 494, 587, 784, 988, 1175].forEach((f, i) => this.tone(f, 1.5, .12, .18 + i * .14, 'triangle')); [392, 587, 784].forEach(f => this.tone(f, 1.5, .09, 1.4, 'sine')); }
  }
}
window.homeCupSound = new HomeCupSound();
