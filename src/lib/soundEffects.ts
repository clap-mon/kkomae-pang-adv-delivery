// 🔊 Web Audio API 기반 꼬매팡 시그니처 사운드 & BGM 오디오 매니저 모듈

let audioCtx: AudioContext | null = null;
let isBgmMutedState = false;
let isSfxMutedState = false;
let isBgmPlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** 🎵 배경음(BGM) 음소거 설정 / 해제 */
export function setBgmMuted(muted: boolean) {
  isBgmMutedState = muted;
  if (muted) {
    stopBgm();
  } else {
    startBgm();
  }
}

export function isBgmMuted(): boolean {
  return isBgmMutedState;
}

/** 🔔 효과음(SFX) 음소거 설정 / 해제 */
export function setSfxMuted(muted: boolean) {
  isSfxMutedState = muted;
}

export function isSfxMuted(): boolean {
  return isSfxMutedState;
}

/** 🔇 전체 사운드 음소거 설정 / 해제 (하위 호환성) */
export function setMuted(muted: boolean) {
  setBgmMuted(muted);
  setSfxMuted(muted);
}

export function isMuted(): boolean {
  return isBgmMutedState && isSfxMutedState;
}

/** 💥 바느질 경로 이탈 / 실 엉킴 경고음 */
export function playTangleSound() {
  if (isSfxMutedState) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. 거친 텐션 튕김음 (Sawtooth Oscillator + Pitch Drop)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);

    // 2. 찌릿한 엉킴 고주파 노이즈/비프음
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(540, now + 0.03);
    osc2.frequency.setValueAtTime(240, now + 0.12);

    gain2.gain.setValueAtTime(0.14, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.03);
    osc2.stop(now + 0.25);
  } catch (e) {
    console.warn("Web Audio playTangleSound failed", e);
  }
}

/** ✨ 3D 바느질 구멍 관통 및 한 땀 완성음 (쏙! 착!) */
export function playPassSound() {
  if (isSfxMutedState) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. 천을 스치는 사각사각 마찰음 (바느질 질감 극대화)
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(2200, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch {}
    
    // 2. 천을 뚫고 지나가는 어택 톤 (타격감 질감 보강)
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = "triangle";
    thudOsc.frequency.setValueAtTime(160, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
    thudGain.gain.setValueAtTime(0.22, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.09);

    // 3. 경쾌한 맑은 톤 (E5 -> A5 쏙!)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  } catch (e) {
    console.warn("Web Audio playPassSound failed", e);
  }
}

/** 🎉 스테이지 클리어 / 수료 팡파레 */
export function playClearFanfare() {
  if (isSfxMutedState) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    });
  } catch (e) {
    console.warn("Web Audio playClearFanfare failed", e);
  }
}

/** ✂️ 가위질 / 쪽가위 실 절단 효과음 */
export function playSnipSound() {
  if (isSfxMutedState) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "highpass" as unknown as OscillatorType;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    console.warn("Web Audio playSnipSound failed", e);
  }
}

// -----------------------------------------------------------------------------
// 🎶 [포근한 바느질 힐링 BGM 엔진] 지브리·동물의숲 감성 어쿠스틱 오르골 & 펠트 피아노 3중주
// -----------------------------------------------------------------------------

let bgmMasterGain: GainNode | null = null;
let bgmSchedulerTimer: NodeJS.Timeout | null = null;
let bgmRunId = 0;
let currentBgmStep = 0;
let nextNoteTime = 0;

// 76 BPM (1박자 = 약 0.789초, 8분음표 = 약 0.395초)
const SECONDS_PER_BEAT = 60 / 76;
const EIGHTH_NOTE = SECONDS_PER_BEAT / 2; // ~0.395s

// 음표 주파수 사전 (Hz)
const N = {
  // 베이스 (옥타브 2)
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  B2: 123.47,

  // 코드 아르페지오 (옥타브 3 & 4)
  C3: 130.81,
  E3: 164.81,
  G3: 196.00,
  A3: 220.00,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,

  // 멜로디 오르골/피아노 (옥타브 5 & 6)
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
  B5: 987.77,
  C6: 1046.50,
  D6: 1174.66,
  E6: 1318.51,
};

// 8마디 힐링 코드 진행 (총 64스텝, 8분음표 단위)
// [Bass, Arpeggio, Melody] 3성부 앙상블 악보
interface BgmScoreStep {
  bass?: number;
  arp?: number;
  melody?: number;
}

const COZY_SEWING_SCORE: BgmScoreStep[] = [
  // ── [마디 1: Cmaj7 - 포근한 첫 땀] ──
  { bass: N.C2, arp: N.G3, melody: N.E5 },
  { arp: N.C4 },
  { arp: N.E4, melody: N.G5 },
  { arp: N.B4 },
  { bass: N.G2, arp: N.E4, melody: N.D5 },
  { arp: N.G4 },
  { arp: N.C4, melody: N.C5 },
  { arp: N.G3 },

  // ── [마디 2: Am7 - 차분한 바늘길] ──
  { bass: N.A2, arp: N.E3, melody: N.C5 },
  { arp: N.A3 },
  { arp: N.C4, melody: N.B4 },
  { arp: N.G4 },
  { bass: N.E2, arp: N.C4, melody: N.A4 },
  { arp: N.E4 },
  { arp: N.A3, melody: N.C5 },
  { arp: N.E3 },

  // ── [마디 3: Dm7 - 사뿐한 실밥] ──
  { bass: N.D2, arp: N.A3, melody: N.F5 },
  { arp: N.D4 },
  { arp: N.F4, melody: N.E5 },
  { arp: N.C5 },
  { bass: N.A2, arp: N.F4, melody: N.D5 },
  { arp: N.A4 },
  { arp: N.D4, melody: N.C5 },
  { arp: N.A3 },

  // ── [마디 4: G7sus4 ➔ G7 - 따스한 미소] ──
  { bass: N.G2, arp: N.D4, melody: N.D5 },
  { arp: N.G4 },
  { arp: N.C5, melody: N.E5 },
  { arp: N.D5 },
  { bass: N.D2, arp: N.B4, melody: N.G5 },
  { arp: N.G4 },
  { arp: N.F4, melody: N.F5 },
  { arp: N.D4 },

  // ── [마디 5: Em7 - 맑은 아침 볕] ──
  { bass: N.E2, arp: N.B3, melody: N.G5 },
  { arp: N.E4 },
  { arp: N.G4, melody: N.B5 },
  { arp: N.D5 },
  { bass: N.B2, arp: N.G4, melody: N.A5 },
  { arp: N.E4 },
  { arp: N.B3, melody: N.G5 },
  { arp: N.G3 },

  // ── [마디 6: Am9 - 깊어지는 정성] ──
  { bass: N.A2, arp: N.E4, melody: N.E5 },
  { arp: N.A4 },
  { arp: N.B4, melody: N.D5 },
  { arp: N.C5 },
  { bass: N.E2, arp: N.A4, melody: N.C5 },
  { arp: N.C4 },
  { arp: N.E3, melody: N.B4 },
  { arp: N.A3 },

  // ── [마디 7: Fmaj7 - 아기자기한 패치워크] ──
  { bass: N.F2, arp: N.C4, melody: N.A5 },
  { arp: N.F4 },
  { arp: N.A4, melody: N.G5 },
  { arp: N.E5 },
  { bass: N.C3, arp: N.A4, melody: N.F5 },
  { arp: N.F4 },
  { arp: N.C4, melody: N.E5 },
  { arp: N.A3 },

  // ── [마디 8: G7add9 ➔ C 여운] ──
  { bass: N.G2, arp: N.D4, melody: N.D5 },
  { arp: N.F4 },
  { arp: N.A4, melody: N.E5 },
  { arp: N.B4 },
  { bass: N.G2, arp: N.F4, melody: N.D5 },
  { arp: N.D4 },
  { arp: N.B3, melody: N.C5 },
  { arp: N.G3 },
];

/** 🎹 따뜻하고 부드러운 펠트 피아노 & 어쿠스틱 아르페지오 음색 합성 */
function schedulePianoNote(ctx: AudioContext, freq: number, time: number, gainNode: GainNode, volume = 0.08) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const noteGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // 따스한 펠트 음색을 위한 로우패스 필터 (귀를 찌르는 고주파 차단)
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1600, time);
  filter.frequency.exponentialRampToValueAtTime(800, time + 0.8);

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(freq, time);

  // 1차 배음(오버톤)을 살짝 섞어 어쿠스틱 울림감 형성
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(freq * 2, time);

  // 부드러운 ADSR 엔벨로프 (손끝으로 건반을 지그시 누르는 느낌)
  noteGain.gain.setValueAtTime(0.0001, time);
  noteGain.gain.linearRampToValueAtTime(volume, time + 0.02);
  noteGain.gain.exponentialRampToValueAtTime(volume * 0.45, time + 0.25);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(gainNode);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 1.15);
  osc2.stop(time + 1.15);
}

/** 🔔 영롱하고 청아한 오르골/카림바 멜로디 음색 합성 */
function scheduleMusicBoxNote(ctx: AudioContext, freq: number, time: number, gainNode: GainNode, volume = 0.09) {
  const osc = ctx.createOscillator();
  const bellOsc = ctx.createOscillator();
  const noteGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // 은은한 오르골 청아함 필터
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(freq * 1.5, time);
  filter.Q.setValueAtTime(1.2, time);

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, time);

  // 미세한 종소리/벨 하모닉스
  bellOsc.type = "sine";
  bellOsc.frequency.setValueAtTime(freq * 3.01, time); // 벨 비정수 배음

  noteGain.gain.setValueAtTime(0.0001, time);
  noteGain.gain.linearRampToValueAtTime(volume, time + 0.01);
  noteGain.gain.exponentialRampToValueAtTime(volume * 0.35, time + 0.18);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.95);

  osc.connect(noteGain);
  bellOsc.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(gainNode);

  osc.start(time);
  bellOsc.start(time);
  osc.stop(time + 1.0);
  bellOsc.stop(time + 1.0);
}

/** 🎻 포근하게 바닥을 감싸주는 서브 베이스 음색 합성 */
function scheduleBassNote(ctx: AudioContext, freq: number, time: number, gainNode: GainNode, volume = 0.12) {
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(280, time);

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, time);

  noteGain.gain.setValueAtTime(0.0001, time);
  noteGain.gain.linearRampToValueAtTime(volume, time + 0.03);
  noteGain.gain.exponentialRampToValueAtTime(volume * 0.6, time + 0.5);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

  osc.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(gainNode);

  osc.start(time);
  osc.stop(time + 1.85);
}

/** 🔓 브라우저 오토플레이 락 해제 및 BGM 즉각 개시 헬퍼 */
export function unlockAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().then(() => {
      if (!isBgmMutedState && !isBgmPlaying) {
        startBgm();
      }
    }).catch(() => {});
  } else if (!isBgmMutedState && !isBgmPlaying) {
    startBgm();
  }
}

/** 🎶 꼬매팡 힐링 BGM 재생 시작 (단 하나의 인스턴스만 보장) */
export function startBgm() {
  // 음소거 상태이면 시작하지 않음
  if (isBgmMutedState) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // 이미 실제 오디오 엔진이 작동 중이고 마스터 게인이 정상 살아있다면 중복 시작 방지
  if (isBgmPlaying && bgmMasterGain && ctx.state === "running") {
    return;
  }

  // 브라우저의 오토플레이 정책으로 AudioContext가 멈춰(suspended) 있는 경우
  if (ctx.state === "suspended") {
    ctx.resume().then(() => {
      // 제스처 후 resume 성공 시점에 정식으로 BGM 재생 시작
      if (!isBgmMutedState && (!isBgmPlaying || !bgmMasterGain)) {
        startBgm();
      }
    }).catch(() => {
      // 제스처가 아직 없어 resume이 차단된 경우: isBgmPlaying을 false로 두어 첫 클릭 시 즉시 재생되도록 준비
      isBgmPlaying = false;
    });
    return;
  }

  // 이전 잔류 스케줄러 및 게인 노드 강제 청소
  stopBgm();

  const currentRunId = ++bgmRunId;
  isBgmPlaying = true;
  currentBgmStep = 0;
  nextNoteTime = ctx.currentTime + 0.08;

  // BGM 전용 마스터 게인 노드 (볼륨 밸런스 및 페이드 제어)
  bgmMasterGain = ctx.createGain();
  bgmMasterGain.gain.setValueAtTime(0.001, ctx.currentTime);
  bgmMasterGain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.6); // 0.6초 페이드인
  bgmMasterGain.connect(ctx.destination);

  // Web Audio 하드웨어 클럭 Lookahead 스케줄러 (100ms 앞을 미리 예약하여 박자 밀림 0% 보장)
  const scheduleLoop = () => {
    // 다른 BGM 인스턴스가 시작되었거나 정지/음소거된 경우 즉시 루프 파기
    if (currentRunId !== bgmRunId || !isBgmPlaying || isBgmMutedState || !bgmMasterGain) {
      return;
    }

    const currentAudioTime = ctx.currentTime;

    // 앞으로 150ms 이내에 연주되어야 할 음표들을 정확한 Web Audio 타임라인에 스케줄링
    while (nextNoteTime < currentAudioTime + 0.18) {
      if (currentRunId !== bgmRunId || !bgmMasterGain) return;

      const stepData = COZY_SEWING_SCORE[currentBgmStep % COZY_SEWING_SCORE.length];

      // 1. 포근한 베이스
      if (stepData.bass) {
        scheduleBassNote(ctx, stepData.bass, nextNoteTime, bgmMasterGain);
      }

      // 2. 조약돌 아르페지오 (펠트 피아노)
      if (stepData.arp) {
        schedulePianoNote(ctx, stepData.arp, nextNoteTime, bgmMasterGain);
      }

      // 3. 서정적인 오르골 멜로디
      if (stepData.melody) {
        scheduleMusicBoxNote(ctx, stepData.melody, nextNoteTime, bgmMasterGain);
      }

      nextNoteTime += EIGHTH_NOTE;
      currentBgmStep++;
    }

    if (currentRunId === bgmRunId && isBgmPlaying && !isBgmMutedState) {
      bgmSchedulerTimer = setTimeout(scheduleLoop, 35);
    }
  };

  scheduleLoop();
}

/** 🛑 BGM 정지 (즉시 볼륨 0 뮤트 & 완벽한 리셋으로 중복 재생 원천 차단) */
export function stopBgm() {
  bgmRunId++; // 실행 중인 모든 scheduleLoop 즉시 실효화
  isBgmPlaying = false;

  if (bgmSchedulerTimer) {
    clearTimeout(bgmSchedulerTimer);
    bgmSchedulerTimer = null;
  }

  if (bgmMasterGain) {
    try {
      const now = audioCtx ? audioCtx.currentTime : 0;
      bgmMasterGain.gain.cancelScheduledValues(now);
      bgmMasterGain.gain.setValueAtTime(0, now);
      bgmMasterGain.disconnect();
    } catch {}
    bgmMasterGain = null;
  }
}


