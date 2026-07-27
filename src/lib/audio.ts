// Web Audio API synthesizer for step sounds & feedback chimes.
// Zero external audio files required. Safe for offline usage.

class SoundSynth {
  private ctx: AudioContext | null = null
  private enabled = true

  constructor() {
    // AudioContext will initialize on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setEnabled(flag: boolean) {
    this.enabled = flag
  }

  public isEnabled() {
    return this.enabled
  }

  // Soft subtle pop for step advancement
  public playStep() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {
      // Audio playback fails gracefully if muted by browser
    }
  }

  // Cheerful chime on program execution completion
  public playDone() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        const startTime = this.ctx.currentTime + idx * 0.08
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.08, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.25)
      })
    } catch {
      // Audio error fallback
    }
  }
}

export const soundSynth = new SoundSynth()

// Warm, Pleasant US American Male Teacher Voice Selector
function getWarmMaleTeacherVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

  const voices = window.speechSynthesis.getVoices()
  if (!voices || voices.length === 0) return null

  // Priority list for natural human US Male teacher voices
  const usMaleNames = [
    'Google US English',
    'Alex',
    'Guy',
    'Aaron',
    'Matthew',
    'Justin',
    'Joey',
    'Christopher',
    'Daniel',
    'Tom',
    'David',
  ]

  for (const name of usMaleNames) {
    const found = voices.find(
      (v) => (v.name.includes(name) || v.name.toLowerCase().includes(name.toLowerCase())) && v.lang.startsWith('en')
    )
    if (found) return found
  }

  const usMale = voices.find(
    (v) => (v.lang === 'en-US' || v.lang === 'en_US') && !v.name.toLowerCase().includes('female')
  )
  if (usMale) return usMale

  return voices.find((v) => v.lang.startsWith('en')) || voices[0] || null
}

// Warm, Pleasant US American Female Teacher Voice Selector (Strict en-US)
function getWarmAmericanTeacherVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

  const voices = window.speechSynthesis.getVoices()
  if (!voices || voices.length === 0) return null

  // Priority US American Female Teacher Voices
  const usFemaleNames = [
    'Samantha',
    'Google US English',
    'Jenny',
    'Aria',
    'Karen',
    'Zira',
    'Ava',
    'Allison',
    'Susan',
    'Siri',
  ]

  // 1. Try exact matches for US Female voices
  for (const name of usFemaleNames) {
    const found = voices.find(
      (v) => (v.name.includes(name) || v.name.toLowerCase().includes(name.toLowerCase())) && (v.lang.startsWith('en'))
    )
    if (found) return found
  }

  // 2. Try any voice explicitly tagged en-US or en_US
  const usVoice = voices.find((v) => (v.lang === 'en-US' || v.lang === 'en_US') && !v.name.toLowerCase().includes('male'))
  if (usVoice) return usVoice

  // 3. Fallback to any English voice
  const englishVoice = voices.find((v) => v.lang.startsWith('en'))
  return englishVoice || voices[0] || null
}

// Browser Speech Synthesis (Text-to-Speech) supporting Female & Male Teacher Voices
export function speakText(
  text: string,
  rate: number = 0.5,
  gender: 'female' | 'male' = 'female',
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd()
    return
  }

  try {
    window.speechSynthesis.cancel() // Stop previous speech
    const cleanText = text
      .replace(/["']/g, '')
      .replace(/=/g, ' equals ')
      .replace(/!=/g, ' is not equal to ')
      .replace(/==/g, ' is equal to ')
      .replace(/>/g, ' is greater than ')
      .replace(/</g, ' is less than ')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'en-US' // Explicitly enforce US American English
    utterance.rate = Math.max(0.65, Math.min(rate, 0.95)) // Calm, patient teacher pace
    utterance.volume = 0.95 // Clear articulation

    if (gender === 'male') {
      utterance.pitch = 1.0 // Natural, warm conversational male pitch
      const maleVoice = getWarmMaleTeacherVoice()
      if (maleVoice) utterance.voice = maleVoice
    } else {
      utterance.pitch = 1.05 // Reassuring, approachable female pitch
      const femaleVoice = getWarmAmericanTeacherVoice()
      if (femaleVoice) utterance.voice = femaleVoice
    }

    if (onEnd) {
      utterance.onend = onEnd
      utterance.onerror = onEnd
    }

    window.speechSynthesis.speak(utterance)
  } catch {
    if (onEnd) onEnd()
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {}
  }
}
