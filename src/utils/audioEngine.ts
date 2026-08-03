class SoundEngine {
  private ctx: AudioContext | null = null
  private bgmGain: GainNode | null = null
  private isMuted: boolean = false
  private viVoice: SpeechSynthesisVoice | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const initVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        this.viVoice = voices.find(v => v.lang.toLowerCase().includes('vi')) || null
      }
      initVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = initVoices
      }
    }
  }

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

  // 2. Âm thanh Đánh Thường (Chém/Vung vũ khí)
  public playAttackSFX() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    // Sóng Sawtooth tạo tiếng xé gió sắc bén
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1)

    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.15)
  }

  // 3. Âm thanh Hồi Máu (Rising Arpeggio phép thuật)
  public playHealSFX() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const notes = [440, 554.37, 659.25, 880] // A major chord

    notes.forEach((freq, idx) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.05)

      gain.gain.setValueAtTime(0.2, now + idx * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.3)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now + idx * 0.05)
      osc.stop(now + idx * 0.05 + 0.3)
    })
  }

  // 4. Âm thanh Hiệu Ứng Nổ Kỹ Năng (Thay thế cho playComboSFX cũ)
  public playSkillImpactSFX() {
    if (this.isMuted) return
    this.initCtx()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    
    // Tiếng rít gồng năng lượng nhanh (0 - 0.2s)
    const chargeOsc = this.ctx.createOscillator()
    const chargeGain = this.ctx.createGain()
    chargeOsc.type = 'sawtooth'
    chargeOsc.frequency.setValueAtTime(200, now)
    chargeOsc.frequency.exponentialRampToValueAtTime(800, now + 0.2)

    chargeGain.gain.setValueAtTime(0.01, now)
    chargeGain.gain.linearRampToValueAtTime(0.3, now + 0.15)
    chargeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    chargeOsc.connect(chargeGain)
    chargeGain.connect(this.ctx.destination)
    chargeOsc.start(now)
    chargeOsc.stop(now + 0.2)

    // Tiếng nổ rền Sub-bass (0.2s - 0.8s)
    const impactOsc = this.ctx.createOscillator()
    const impactGain = this.ctx.createGain()
    impactOsc.type = 'square'
    impactOsc.frequency.setValueAtTime(300, now + 0.2)
    impactOsc.frequency.exponentialRampToValueAtTime(20, now + 0.8)

    impactGain.gain.setValueAtTime(0.6, now + 0.2)
    impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8)

    impactOsc.connect(impactGain)
    impactGain.connect(this.ctx.destination)
    impactOsc.start(now + 0.2)
    impactOsc.stop(now + 0.8)
  }

  // 5. Đọc Tên Kỹ Năng & Hợp Kỹ Bằng Giọng Nói (Text-To-Speech)
  public playSkillVoice(skillName: string, battleSpeed: number = 1) {
    if (this.isMuted) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    try {
      // Loại bỏ các ký tự đặc biệt như [HỢP KỸ], [TUYỆT KỸ] để đọc chuẩn
      const textToRead = skillName.replace(/\[.*?\]/g, '').trim()
      if (!textToRead) return

      window.speechSynthesis.cancel()

      // Tạo trễ nhỏ (30ms) để Chrome xử lý xong lệnh cancel()
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToRead)
        utterance.lang = 'vi-VN'
        
        // Tốc độ điều chỉnh theo battleSpeed (1 -> 1.15, 2 -> 1.4, 3 -> 1.65)
        utterance.rate = Math.min(2.0, 1.15 + ((battleSpeed - 1) * 0.25))
        utterance.pitch = 1.1

        const voices = window.speechSynthesis.getVoices()
        const voice = this.viVoice || voices.find(v => v.lang.toLowerCase().includes('vi'))
        if (voice) {
          utterance.voice = voice
        }

        window.speechSynthesis.speak(utterance)
      }, 30)
    } catch (err) {
      console.warn('TTS Error:', err)
    }
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
