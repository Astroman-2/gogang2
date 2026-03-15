// ═══════════════════════════════════════════════════════════════
// NAVAGRAHA RAGA AUDIO SYNTHESIZER
// Generates authentic-sounding sitar & tabla tones via Web Audio API
// ═══════════════════════════════════════════════════════════════

window.RagaAudio = {
  ctx: null,
  masterGain: null,
  playing: false,
  currentScheduled: [],

  // Shruti / frequency table in Hz (base Sa = A3 = 220 Hz)
  BASE_SA: 220,

  // Swara ratios (just intonation)
  RATIOS: {
    'S':  1.0,
    'R1': 16/15, 'R2': 9/8,  'R3': 6/5,
    'G2': 6/5,   'G3': 5/4,  'G4': 81/64,
    'M1': 4/3,   'M2': 45/32,
    'P':  3/2,
    'D1': 8/5,   'D2': 5/3,  'D3': 16/9,
    'N2': 16/9,  'N3': 15/8, 'N4': 2/1
  },

  // Raga scale definitions (swaras in order)
  RAGA_SCALES: {
    'Saurashtra':       ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N3'],
    'Asaveri':          ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N2'],
    'Surati':           ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N2'],
    'Nattakurunji':     ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N2'],
    'Athana':           ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N2'],
    'Paraju':           ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3'],
    'Yadukulakambhoji': ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N2'],
    'Ramapriya':        ['S', 'R2', 'G2', 'M2', 'P', 'D2', 'N2'],
    'Shanmukhapriya':   ['S', 'R2', 'G2', 'M2', 'P', 'D1', 'N2']
  },

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  getFreq(swara, octaveOffset = 0) {
    const ratio = this.RATIOS[swara] || 1;
    return this.BASE_SA * ratio * Math.pow(2, octaveOffset);
  },

  // ─── Sitar-like tone using multiple oscillators ───
  createSitarNote(freq, startTime, duration, gain = 0.4) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Sitar timbre: sawtooth + partials
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);
    // Characteristic sitar "buzz" — sympathetic strings simulation
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.003, startTime); // slight detune
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2.01, startTime); // octave partial

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 3, startTime);
    filter.Q.setValueAtTime(2, startTime);

    // Attack-decay envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(gain * 0.6, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    osc3.stop(startTime + duration);

    this.currentScheduled.push(osc1, osc2, osc3);
  },

  // ─── Tabla-like percussion ───
  createTablaHit(startTime, type = 'bayan', gain = 0.5) {
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (type === 'bayan') {
      // Low dha sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, startTime);
      osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.15);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, startTime);
      gainNode.gain.setValueAtTime(gain, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    } else if (type === 'tun') {
      // High tin sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, startTime);
      osc.frequency.exponentialRampToValueAtTime(180, startTime + 0.08);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, startTime);
      filter.Q.setValueAtTime(4, startTime);
      gainNode.gain.setValueAtTime(gain * 0.8, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
    } else {
      // Na / ka
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, startTime);
      osc.frequency.exponentialRampToValueAtTime(120, startTime + 0.06);
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(100, startTime);
      gainNode.gain.setValueAtTime(gain * 0.6, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
    }

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.4);
    this.currentScheduled.push(osc);
  },

  // ─── Tanpura drone ───
  createDrone(swaras, duration) {
    const startTime = this.ctx.currentTime;
    swaras.forEach((swara, i) => {
      const freq = this.getFreq(swara, swara === 'S' && i > 0 ? -1 : 0);
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const chorus1 = this.ctx.createOscillator();
      const gainC = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      chorus1.type = 'sine';
      chorus1.frequency.setValueAtTime(freq * 1.001, startTime);

      gainNode.gain.setValueAtTime(0.08, startTime);
      gainC.gain.setValueAtTime(0.04, startTime);

      osc.connect(gainNode);
      chorus1.connect(gainC);
      gainNode.connect(this.masterGain);
      gainC.connect(this.masterGain);

      osc.start(startTime);
      chorus1.start(startTime);
      osc.stop(startTime + duration);
      chorus1.stop(startTime + duration);
      this.currentScheduled.push(osc, chorus1);
    });
  },

  // ─── Play a full raga piece (30 seconds) ───
  playRaga(ragaName, callback) {
    this.init();
    this.stopAll();
    this.playing = true;

    const scale = this.RAGA_SCALES[ragaName] || this.RAGA_SCALES['Saurashtra'];
    const totalDuration = 30;
    const now = this.ctx.currentTime;

    // Start drone
    this.createDrone(['S', 'P', 'S'], totalDuration);

    // Raga-specific rhythmic feel
    const tempos = {
      'Saurashtra': 100, 'Asaveri': 72, 'Surati': 120, 'Nattakurunji': 110,
      'Athana': 88, 'Paraju': 76, 'Yadukulakambhoji': 64,
      'Ramapriya': 80, 'Shanmukhapriya': 92
    };

    const bpm = tempos[ragaName] || 90;
    const beat = 60 / bpm;

    // Tabla pattern (teental-like: dha ge na ti na / ka ta ge na)
    const tablaPattern = [
      { type: 'bayan', offset: 0 },
      { type: 'tun',   offset: beat * 0.5 },
      { type: 'na',    offset: beat * 1.0 },
      { type: 'tun',   offset: beat * 1.5 },
      { type: 'bayan', offset: beat * 2.0 },
      { type: 'na',    offset: beat * 2.5 },
      { type: 'tun',   offset: beat * 3.0 },
      { type: 'na',    offset: beat * 3.5 }
    ];

    // Schedule tabla throughout
    for (let t = 0; t < totalDuration; t += beat * 4) {
      tablaPattern.forEach(hit => {
        if (t + hit.offset < totalDuration) {
          this.createTablaHit(now + t + hit.offset, hit.type, 0.35);
        }
      });
    }

    // Generate melodic line
    this.playMelodicLine(scale, ragaName, now, totalDuration, beat);

    // Callback when done
    this._playTimeout = setTimeout(() => {
      this.playing = false;
      if (callback) callback();
    }, totalDuration * 1000);
  },

  playMelodicLine(scale, ragaName, startTime, duration, beat) {
    let t = startTime + 1.5; // slight delay after start
    const allSwaras = [...scale, scale[scale.length-1], ...scale.slice().reverse()];

    const phrases = this.generatePhrases(scale, ragaName);

    phrases.forEach(phrase => {
      if (t - startTime >= duration - 2) return;
      phrase.forEach(noteData => {
        if (t - startTime >= duration - 0.5) return;
        this.createSitarNote(
          this.getFreq(noteData.swara, noteData.octave || 0),
          t,
          noteData.dur * beat * 0.9,
          noteData.gain || 0.35
        );
        t += noteData.dur * beat;
      });
      t += beat * 0.5; // gap between phrases
    });
  },

  generatePhrases(scale, ragaName) {
    // Different melodic patterns for each raga character
    const ascending = scale.map(s => ({ swara: s, dur: 0.75, octave: 0 }));
    const descending = scale.slice().reverse().map(s => ({ swara: s, dur: 0.75, octave: 0 }));

    const gamaka = (swaras) => swaras.map(s => ({ swara: s, dur: 0.5, octave: 0, gain: 0.3 }));

    // Madhyasthai (middle octave) exploration
    const mid = scale.slice(2, 6).map(s => ({ swara: s, dur: 1, octave: 0 }));
    // Tara (upper) touch
    const upper = [scale[scale.length-2], scale[scale.length-1], scale[scale.length-1]]
      .map(s => ({ swara: s, dur: 0.5, octave: 1, gain: 0.25 }));
    // Return to Sa
    const resolve = [{ swara: 'S', dur: 2, octave: 0, gain: 0.4 }];

    return [
      ascending,
      mid,
      descending,
      gamaka(scale),
      upper,
      [...scale.slice(1,4).map(s => ({swara:s, dur:0.75, octave:0})), ...upper],
      descending,
      resolve
    ];
  },

  stopAll() {
    this.playing = false;
    clearTimeout(this._playTimeout);
    this.currentScheduled.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    this.currentScheduled = [];
  },

  setVolume(v) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(v, this.ctx?.currentTime || 0);
    }
  }
};
