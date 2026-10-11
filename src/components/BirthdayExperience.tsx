'use client';

import React, { useState } from 'react';
import { SceneCanvas, ExperienceStage } from './canvas/SceneCanvas';
import { BirthdayStageBanner } from './BirthdayStageBanner';
import { BirthdayWishCardModal } from './ui/BirthdayWishCardModal';
import { BirthdayPasscodeGate } from './ui/BirthdayPasscodeGate';
import { CosmicMemoriesUniverse } from './CosmicMemoriesUniverse';
import { romanticAudio } from '@/lib/audio';
import { Sparkles, Volume2, VolumeX, Heart, Cake, Flame, Wand2, X } from 'lucide-react';

export function BirthdayExperience() {
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [stage, setStage] = useState<ExperienceStage>('universe');
  const [isTextReady, setIsTextReady] = useState<boolean>(false);
  const [isCakeReady, setIsCakeReady] = useState<boolean>(false);
  const [isCandlesBlown, setIsCandlesBlown] = useState<boolean>(false);
  const [showWishModal, setShowWishModal] = useState<boolean>(false);
  const [showMemoriesUniverse, setShowMemoriesUniverse] = useState<boolean>(false);

  // Sync audio state with actual audio element events
  React.useEffect(() => {
    const audio = romanticAudio.getOrCreateBgAudio();
    if (!audio) return;

    const onPlay = () => setIsPlayingMusic(true);
    const onPause = () => setIsPlayingMusic(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    if (!audio.paused) {
      setIsPlayingMusic(true);
    }

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // Aggressive instant autoplay upon entering website + global interaction backup
  React.useEffect(() => {
    // 1. Attempt immediate playback on mount
    romanticAudio.playMusic();

    // 2. Global gesture triggers (pointerdown, click, touchstart, keydown)
    const triggerAudio = () => {
      if (!romanticAudio.getIsPlaying()) {
        romanticAudio.playMusic();
      }
    };

    window.addEventListener('pointerdown', triggerAudio);
    window.addEventListener('click', triggerAudio);
    window.addEventListener('touchstart', triggerAudio);
    window.addEventListener('keydown', triggerAudio);

    return () => {
      window.removeEventListener('pointerdown', triggerAudio);
      window.removeEventListener('click', triggerAudio);
      window.removeEventListener('touchstart', triggerAudio);
      window.removeEventListener('keydown', triggerAudio);
    };
  }, []);

  // Transition handler
  const handleMainButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Ensure audio starts immediately
    if (!romanticAudio.getIsPlaying()) {
      romanticAudio.playMusic();
    }

    // Stage 1 -> Stage 2: Universe to Text
    if (stage === 'universe') {
      setStage('text');
      return;
    }

    // Stage 2 -> Stage 3: Text to 3D Cake
    if (stage === 'text') {
      if (!isTextReady) return; // wait until assembled
      setStage('cake');
      return;
    }

    // Stage 3: Cake is active.
    // Clicks on the screen or background do NOT open the letter.
    // The letter ONLY opens when the user clicks "Em nhận thư của anh nè 😘😘 ✉".
  };

  const handleTextComplete = React.useCallback(() => {
    setIsTextReady(true);
  }, []);

  const handleCakeComplete = React.useCallback(() => {
    setIsCakeReady(true);
  }, []);

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const active = romanticAudio.toggleMusic();
    setIsPlayingMusic(active);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05020a] select-none">
      {/* 3D WebGL Canvas Layer: Free 360-degree orbit rotation on drag */}
      <SceneCanvas
        stage={stage}
        onTextComplete={handleTextComplete}
        onCakeComplete={handleCakeComplete}
        isCandlesBlown={isCandlesBlown}
      />

      {/* Cloned Happy Birthday Typography & Floating Balloon Photo (Stage: Cake) */}
      {stage === 'cake' && (
        <BirthdayStageBanner
          onOpenWish={() => setShowWishModal(true)}
        />
      )}

      {/* 0. TikTok Passcode Gate Lock Screen: "Hãy nhập ngày sinh của công chúa" (Mật khẩu: 1310) */}
      {!isUnlocked && (
        <BirthdayPasscodeGate
          onUnlock={() => {
            setIsUnlocked(true);
            setIsPlayingMusic(true);
          }}
          correctPasscode="1310"
        />
      )}

      {/* Audio Control at Top Right */}
      {isUnlocked && (
        <div className="absolute top-3 sm:top-5 right-3 sm:right-6 z-40 pointer-events-none">
          <div className="pointer-events-auto">
            <button
              onClick={handleToggleMusic}
              className={`p-2.5 sm:p-3 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
                isPlayingMusic
                  ? 'bg-pink-500/25 border-pink-400/50 text-pink-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
              title={isPlayingMusic ? 'Tắt nhạc' : 'Bật nhạc'}
              aria-label="Toggle Music"
            >
              {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Screen Touch Prompt at Bottom Center (Only for Universe and Text stages) */}
      {isUnlocked && stage !== 'cake' && (
        <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-30 flex items-center justify-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom,0px)]">
          <button
            id="btn-transition"
            onClick={handleMainButtonClick}
            disabled={stage === 'text' && !isTextReady}
            className={`pointer-events-auto group px-5 sm:px-6 py-2.5 sm:py-2 min-h-[44px] rounded-full glass-pill border border-pink-400/25 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              stage === 'text' && !isTextReady
                ? 'opacity-60 cursor-wait text-pink-300/60'
                : 'hover:scale-105 active:scale-95 text-pink-100 hover:text-white hover:border-pink-300/50 box-glow-pink'
            }`}
          >
            {stage === 'universe' && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                <span className="text-sm sm:text-base font-light tracking-widest glow-pink-sm">
                  Chạm vào màn hình ✨
                </span>
                <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
              </>
            )}

            {stage === 'text' && (
              <>
                {!isTextReady ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-spin" />
                    <span className="text-sm sm:text-base font-light tracking-wider">Đang dệt nên lời chúc...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                    <span className="text-sm sm:text-base font-light tracking-widest glow-pink-sm">
                      Chạm vào màn hình ✨
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                  </>
                )}
              </>
            )}
          </button>
        </div>
      )}

      {/* Vintage Cream Letter Modal (Opens when clicking "Em nhận thư của anh nè 😘😘 ✉") */}
      {showWishModal && (
        <BirthdayWishCardModal
          onClose={() => setShowWishModal(false)}
          onOpenUniverse={() => {
            setShowWishModal(false);
            setShowMemoriesUniverse(true);
          }}
        />
      )}

      {/* Cosmic Galaxy Memories & Falling Wishes (Trang vũ trụ ảnh và lời chúc trôi từ từ từ trên xuống dưới) */}
      {showMemoriesUniverse && (
        <CosmicMemoriesUniverse onBack={() => setShowMemoriesUniverse(false)} />
      )}
    </main>
  );
}
