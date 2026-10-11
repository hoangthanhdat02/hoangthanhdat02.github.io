'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Delete, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticAudio } from '@/lib/audio';
import { getAssetPath } from '@/lib/basePath';

interface BirthdayPasscodeGateProps {
  onUnlock: () => void;
  correctPasscode?: string;
}

export function BirthdayPasscodeGate({
  onUnlock,
  correctPasscode = '1310',
}: BirthdayPasscodeGateProps) {
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sweet tactile tone synthesizer on key tap
  const playTone = useCallback((freq = 520, type: OscillatorType = 'sine', duration = 0.12) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio error fallback
    }
  }, []);

  // Handle digit input
  const handleDigit = useCallback(
    (digit: string) => {
      if (isSuccess || isExiting) return;
      if (enteredCode.length >= 4) return;

      // Play sweet cute ascending note
      const noteFreq = 480 + parseInt(digit, 10) * 32;
      playTone(noteFreq, 'sine', 0.11);

      setIsError(false);
      setFeedbackMessage('');
      const newCode = enteredCode + digit;
      setEnteredCode(newCode);

      // Verify once 4 digits are completed
      if (newCode.length === 4) {
        if (newCode === correctPasscode) {
          // Success!
          setIsSuccess(true);
          setFeedbackMessage('Chính xác rồi! Yêu em bé Khánh Huyền ❤️');

          // Celebratory arpeggio chord
          playTone(523.25, 'sine', 0.2); // C5
          setTimeout(() => playTone(659.25, 'sine', 0.2), 100); // E5
          setTimeout(() => playTone(783.99, 'sine', 0.2), 200); // G5
          setTimeout(() => playTone(1046.5, 'sine', 0.35), 300); // C6

          // Celebratory Confetti & Hearts
          confetti({
            particleCount: 70,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#ff6b8b', '#ff85a2', '#fbcfe8', '#ffd166', '#ffffff'],
          });

          // Autoplay background music immediately upon verified user gesture
          romanticAudio.playMusic();

          // Smooth exit transition
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              onUnlock();
            }, 550);
          }, 750);
        } else {
          // Error
          setIsError(true);
          playTone(240, 'triangle', 0.25);
          setTimeout(() => playTone(190, 'triangle', 0.25), 120);

          setFeedbackMessage('Hông đúng òi! Ngày sinh của em bé mà 🥺 (Gợi ý: 1310)');
          setTimeout(() => {
            setEnteredCode('');
            setIsError(false);
          }, 900);
        }
      }
    },
    [enteredCode, isSuccess, isExiting, correctPasscode, onUnlock, playTone]
  );

  // Clear all digits
  const handleClear = useCallback(() => {
    if (isSuccess || isExiting) return;
    playTone(340, 'sine', 0.09);
    setEnteredCode('');
    setIsError(false);
    setFeedbackMessage('');
  }, [isSuccess, isExiting, playTone]);

  // Backspace single digit
  const handleDelete = useCallback(() => {
    if (isSuccess || isExiting) return;
    playTone(390, 'sine', 0.09);
    setEnteredCode((prev) => prev.slice(0, -1));
    setIsError(false);
    setFeedbackMessage('');
  }, [isSuccess, isExiting, playTone]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess || isExiting) return;
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete, handleClear, isSuccess, isExiting]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-3 sm:p-5 select-none transition-all duration-500 pointer-events-auto ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dreamy Dark Romantic Cosmic Backdrop */}
      <div className="absolute inset-0 bg-[#05020a]/75 backdrop-blur-md pointer-events-auto" />

      {/* Main Passcode Modal Card: Always SIDE-BY-SIDE like Image 2, even on phone */}
      <div
        className={`relative z-10 w-full max-w-[420px] xs:max-w-[460px] sm:max-w-[580px] md:max-w-[620px] bg-[#fffcf7] rounded-[22px] xs:rounded-[26px] sm:rounded-[32px] p-2.5 xs:p-3.5 sm:p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-[#f5eadc] transition-all duration-300 pointer-events-auto ${
          isError ? 'animate-shake border-red-300' : ''
        } ${isSuccess ? 'border-pink-400 shadow-[0_0_40px_rgba(255,105,180,0.4)]' : ''}`}
      >
        {/* Notebook grid texture watermark */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 rounded-[22px] xs:rounded-[26px] sm:rounded-[32px]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(235, 205, 215, 0.45) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(235, 205, 215, 0.45) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* 2-Column SIDE-BY-SIDE Layout matching TikTok/CapCut reference */}
        <div className="relative z-10 flex flex-row items-center sm:items-stretch gap-2.5 xs:gap-3.5 sm:gap-5 md:gap-6">
          {/* LEFT: Portrait Photo of Khánh Huyền (Ảnh gương váy trắng user cung cấp) */}
          <div className="flex flex-col items-center justify-center w-[100px] xs:w-[120px] sm:w-[195px] md:w-[225px] flex-shrink-0">
            <div className="relative w-full aspect-[3/4] rounded-[14px] xs:rounded-[18px] sm:rounded-[22px] overflow-hidden border-2 sm:border-[3.5px] border-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] bg-[#eae3d5] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getAssetPath('/images/passcode-photo.png')}
                alt="Khánh Huyền"
                className="w-full h-full object-cover object-[center_20%] scale-105 group-hover:scale-110 transition-transform duration-500"
              />

              {/* Sweet Corner Princess Badge */}
              <div className="absolute top-1.5 left-1.5 xs:top-2 xs:left-2 px-1.5 xs:px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-pink-600 shadow-sm flex items-center gap-1">
                <span>👑</span>
                <span className="hidden xs:inline">Công chúa</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Passcode Input Screen & 3x4 Touch Keypad */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* Header Title matching TikTok reference */}
            <div className="mb-1 xs:mb-1.5 sm:mb-2 text-center sm:text-left">
              <h2 className="text-[#db4d44] font-bold text-[11px] xs:text-[13px] sm:text-base md:text-lg tracking-wide flex items-center justify-center sm:justify-start gap-1 font-sans leading-tight">
                <span>Hãy nhập ngày sinh của công chúa</span>
                <span className="text-xs sm:text-sm animate-pulse">🎂</span>
              </h2>
            </div>

            {/* Display Input Box (Soft Creamy Peach Container matching reference) */}
            <div className="relative w-full h-8 xs:h-9 sm:h-11 md:h-12 bg-[#faecd8] rounded-[10px] xs:rounded-[12px] sm:rounded-[16px] border border-[#f2dac0] shadow-inner flex items-center justify-center gap-2.5 xs:gap-3 sm:gap-4 px-2 xs:px-3">
              {[0, 1, 2, 3].map((slotIdx) => {
                const char = enteredCode[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className="w-4 xs:w-5 sm:w-7 h-6 sm:h-8 flex items-center justify-center border-b-2 border-[#d4b99d]"
                  >
                    {char ? (
                      <span className="text-sm xs:text-base sm:text-xl md:text-2xl font-black text-[#422e28] animate-pop-letter">
                        {char}
                      </span>
                    ) : (
                      <span className="w-1.5 xs:w-2 h-1.5 xs:h-2 rounded-full bg-[#c9ab8d]/60" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status / Hint feedback line */}
            <div className="h-4 xs:h-4.5 sm:h-5 flex items-center justify-center sm:justify-start px-0.5 my-0.5">
              {feedbackMessage ? (
                <p
                  className={`text-[9px] xs:text-[10px] sm:text-xs font-semibold text-center sm:text-left transition-all truncate ${
                    isError ? 'text-red-500 animate-pulse' : 'text-pink-600'
                  }`}
                >
                  {feedbackMessage}
                </p>
              ) : (
                <p className="text-[9px] xs:text-[10px] sm:text-xs text-[#8c7467] italic text-center sm:text-left truncate">
                  Gợi ý: 4 số ngày sinh nhật (ddmm) ✨
                </p>
              )}
            </div>

            {/* 3x4 Touch Keypad matching reference layout */}
            <div className="grid grid-cols-3 gap-1 xs:gap-1.5 sm:gap-2 w-full mt-0.5 sm:mt-1">
              {/* Row 1: 1, 2, 3 */}
              {['1', '2', '3'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num)}
                  style={{ touchAction: 'manipulation' }}
                  className="h-8 xs:h-9 sm:h-10 md:h-11 rounded-[9px] xs:rounded-[11px] sm:rounded-[14px] bg-[#fffefb] hover:bg-white active:scale-95 active:bg-[#f6ebd9] border border-[#ede2d2] shadow-[0_1.5px_3px_rgba(0,0,0,0.03)] font-bold text-sm xs:text-base sm:text-xl text-[#4a3a35] flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  {num}
                </button>
              ))}

              {/* Row 2: 4, 5, 6 */}
              {['4', '5', '6'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num)}
                  style={{ touchAction: 'manipulation' }}
                  className="h-8 xs:h-9 sm:h-10 md:h-11 rounded-[9px] xs:rounded-[11px] sm:rounded-[14px] bg-[#fffefb] hover:bg-white active:scale-95 active:bg-[#f6ebd9] border border-[#ede2d2] shadow-[0_1.5px_3px_rgba(0,0,0,0.03)] font-bold text-sm xs:text-base sm:text-xl text-[#4a3a35] flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  {num}
                </button>
              ))}

              {/* Row 3: 7, 8, 9 */}
              {['7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num)}
                  style={{ touchAction: 'manipulation' }}
                  className="h-8 xs:h-9 sm:h-10 md:h-11 rounded-[9px] xs:rounded-[11px] sm:rounded-[14px] bg-[#fffefb] hover:bg-white active:scale-95 active:bg-[#f6ebd9] border border-[#ede2d2] shadow-[0_1.5px_3px_rgba(0,0,0,0.03)] font-bold text-sm xs:text-base sm:text-xl text-[#4a3a35] flex items-center justify-center transition-all cursor-pointer select-none"
                >
                  {num}
                </button>
              ))}

              {/* Row 4: C (Clear), 0, ⌫ (Delete) */}
              <button
                type="button"
                onClick={handleClear}
                style={{ touchAction: 'manipulation' }}
                className="h-8 xs:h-9 sm:h-10 md:h-11 rounded-[9px] xs:rounded-[11px] sm:rounded-[14px] bg-[#fff7ef] hover:bg-white active:scale-95 active:bg-[#f3ded0] border border-[#eedfd0] shadow-[0_1.5px_3px_rgba(0,0,0,0.03)] font-bold text-xs xs:text-sm sm:text-base text-[#c45a4a] flex items-center justify-center transition-all cursor-pointer select-none"
                title="Xóa tất cả"
              >
                C
              </button>

              <button
                type="button"
                onClick={() => handleDigit('0')}
                style={{ touchAction: 'manipulation' }}
                className="h-8 xs:h-9 sm:h-10 md:h-11 rounded-[9px] xs:rounded-[11px] sm:rounded-[14px] bg-[#fffefb] hover:bg-white active:scale-95 active:bg-[#f6ebd9] border border-[#ede2d2] shadow-[0_1.5px_3px_rgba(0,0,0,0.03)] font-bold text-sm xs:text-base sm:text-xl text-[#4a3a35] flex items-center justify-center transition-all cursor-pointer select-none"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDelete}
                style={{ touchAction: 'manipulation' }}
                className="h-8 xs:h-9 sm:h-10 md:h-11 rounded-[9px] xs:rounded-[11px] sm:rounded-[14px] bg-[#fff7ef] hover:bg-white active:scale-95 active:bg-[#f3ded0] border border-[#eedfd0] shadow-[0_1.5px_3px_rgba(0,0,0,0.03)] font-bold text-[#8a6b5e] hover:text-[#4a3a35] flex items-center justify-center transition-all cursor-pointer select-none"
                title="Xóa ký tự cuối"
              >
                <Delete className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
