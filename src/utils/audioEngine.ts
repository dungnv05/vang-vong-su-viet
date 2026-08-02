// Web Audio API Synthesizer cho Âm Thanh Game Sử Việt (Zero External Assets Required)
class SoundEngine {
  private ctx: AudioContext | null = null
  private bgmGain: GainNode | null = null
  private isMuted: boolean = false

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.15, this.ctx.currentTime)
    }
  }

  // 1. Âm thanh nhấp nút UI
  public playClick() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.08)
  }

  // 2. Âm thanh Hợp Kích Tráng Lệ 3.2 giây (Dồn Trống Trận -> Tích Năng Lượng -> Oanh Kích Sét Bùng Nổ)
  public playComboSFX() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime

    // Giai đoạn 1: Dồn Trống Trận Xuất Quân (0.0s - 1.2s) - 4 Nhịp trống liên tiếp
    const drumTimes = [0.0, 0.3, 0.6, 0.9]
    drumTimes.forEach((dt, idx) => {
      if (!this.ctx) return
      const drumOsc = this.ctx.createOscillator()
      const drumGain = this.ctx.createGain()

      drumOsc.type = 'triangle'
      const freq = 120 + idx * 30
      drumOsc.frequency.setValueAtTime(freq, now + dt)
      drumOsc.frequency.exponentialRampToValueAtTime(30, now + dt + 0.25)

      drumGain.gain.setValueAtTime(0.5, now + dt)
      drumGain.gain.exponentialRampToValueAtTime(0.01, now + dt + 0.25)

      drumOsc.connect(drumGain)
      drumGain.connect(this.ctx.destination)

      drumOsc.start(now + dt)
      drumOsc.stop(now + dt + 0.25)
    })

    // Giai đoạn 2: Tù Và Xuất Trận & Tích Năng Lượng Khí Cầu (1.0s - 2.2s)
    const hornOsc = this.ctx.createOscillator()
    const hornGain = this.ctx.createGain()
    hornOsc.type = 'sawtooth'
    hornOsc.frequency.setValueAtTime(300, now + 1.0)
    hornOsc.frequency.exponentialRampToValueAtTime(600, now + 2.0)

    hornGain.gain.setValueAtTime(0.01, now + 1.0)
    hornGain.gain.linearRampToValueAtTime(0.35, now + 1.8)
    hornGain.gain.exponentialRampToValueAtTime(0.01, now + 2.2)

    hornOsc.connect(hornGain)
    hornGain.connect(this.ctx.destination)

    hornOsc.start(now + 1.0)
    hornOsc.stop(now + 2.2)

    // Giai đoạn 3: OANH KÍCH SẤM SÉT BÙNG NỔ (2.2s - 3.2s) - Sub-bass + Hi-freq Crash
    const impactOsc = this.ctx.createOscillator()
    const impactGain = this.ctx.createGain()
    impactOsc.type = 'square'
    impactOsc.frequency.setValueAtTime(250, now + 2.2)
    impactOsc.frequency.exponentialRampToValueAtTime(20, now + 3.2)

    impactGain.gain.setValueAtTime(0.7, now + 2.2)
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2)

    impactOsc.connect(impactGain)
    impactGain.connect(this.ctx.destination)

    impactOsc.start(now + 2.2)
    impactOsc.stop(now + 3.2)
  }

  // 3. Âm thanh Quay Gacha Hào Quang Huyền Diệu
  public playGachaPullSFX() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]

    notes.forEach((freq, idx) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.1)

      gain.gain.setValueAtTime(0.2, now + idx * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now + idx * 0.1)
      osc.stop(now + idx * 0.1 + 0.4)
    })
  }

  // 4. Âm thanh Đại Thắng Khai Khải (Triumph Fanfare)
  public playVictorySFX() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const melody = [
      { f: 523.25, d: 0.2 },
      { f: 659.25, d: 0.2 },
      { f: 783.99, d: 0.2 },
      { f: 1046.50, d: 0.6 }
    ]

    let timeOffset = 0
    melody.forEach((note) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(note.f, now + timeOffset)

      gain.gain.setValueAtTime(0.4, now + timeOffset)
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + note.d)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now + timeOffset)
      osc.stop(now + timeOffset + note.d)

      timeOffset += note.d * 0.8
    })
  }

  // 5. Âm thanh Mặc Thần Khí
  public playEquipSFX() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.15)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.15)
  }
}

export const audioEngine = new SoundEngine()
