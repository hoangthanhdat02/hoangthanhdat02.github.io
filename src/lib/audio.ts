// Pure Background Music Engine for Custom Audio (nhac.mp4)
// Built-in Web Audio Pre-amp Amplifier for Volume Boosting (up to 200%+)

class RomanticAudioEngine {
  private bgAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  // Hệ số khuếch đại âm lượng: 2.0 (tăng gấp đôi âm lượng gốc, giúp nhạc to rõ hơn hẳn)
  private boostMultiplier: number = 2.0;

  public getOrCreateBgAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.bgAudio) {
      this.bgAudio = new Audio('/images/nhac.mp4');
      this.bgAudio.loop = true;
      this.bgAudio.preload = 'auto';
      this.bgAudio.volume = 1.0; // Đặt âm lượng trình duyệt lên mức tối đa (100%)

      // Fallback sang /nhac.mp4 nếu /images/nhac.mp4 gặp sự cố
      this.bgAudio.addEventListener('error', () => {
        if (this.bgAudio && this.bgAudio.src.includes('/images/nhac.mp4')) {
          this.bgAudio.src = '/nhac.mp4';
          this.bgAudio.load();
          this.bgAudio.play().catch(() => {});
        }
      });
    }
    return this.bgAudio;
  }

  // Khởi tạo bộ khuếch đại âm thanh Web Audio API Pre-amp Booster
  private setupAmplifier() {
    if (typeof window === 'undefined' || this.gainNode || !this.bgAudio) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.sourceNode = this.audioCtx.createMediaElementSource(this.bgAudio);
      this.gainNode = this.audioCtx.createGain();
      // Khuếch đại âm lượng lên gấp 2 lần (200%)
      this.gainNode.gain.setValueAtTime(this.boostMultiplier, this.audioCtx.currentTime);
      this.sourceNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
    } catch (e) {
      console.warn('Audio pre-amp fallback to standard 100% volume:', e);
    }
  }

  public async playMusic(): Promise<boolean> {
    const audio = this.getOrCreateBgAudio();
    if (!audio) return false;

    // Kích hoạt bộ khuếch đại
    this.setupAmplifier();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    try {
      await audio.play();
      return true;
    } catch (err) {
      console.warn('Autoplay blocked by browser policy, waiting for user gesture:', err);
      return false;
    }
  }

  public pauseMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  public toggleMusic(): boolean {
    const audio = this.getOrCreateBgAudio();
    if (!audio) return false;
    if (!audio.paused) {
      audio.pause();
      return false;
    } else {
      this.playMusic();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return Boolean(this.bgAudio && !this.bgAudio.paused);
  }

  // Tùy chỉnh hệ số khuếch đại âm lượng nếu muốn chỉnh to hơn nữa
  public setVolumeBoost(multiplier: number) {
    this.boostMultiplier = multiplier;
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(multiplier, this.audioCtx.currentTime);
    }
  }

  // Toàn bộ hiệu ứng âm thanh phụ đã được tắt theo yêu cầu
  public playPopSound(_pitchMultiplier?: number) {}
  public playSparkleSound() {}
  public playPaperSound() {}
}

export const romanticAudio = new RomanticAudioEngine();
