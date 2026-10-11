'use client';

import React, { useState } from 'react';
import { Heart, Mail, Sparkles, X, RotateCcw, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticAudio } from '@/lib/audio';
import { BirthdayConfig } from '@/types/birthday';

interface LetterModalProps {
  config: BirthdayConfig;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export function LetterModal({ config, isOpen, onClose, onRestart }: LetterModalProps) {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpenLetter = () => {
    setIsOpened(true);
    romanticAudio.playPaperSound();

    // Trigger sweet confetti fireworks
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff4d8d', '#ff85a2', '#fbcfe8', '#f43f5e', '#ffd166'],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md pointer-events-auto">
      {/* Background click to dismiss if opened */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg transition-all duration-500">
        {!isOpened ? (
          // Sealed Romantic Envelope
          <div
            onClick={handleOpenLetter}
            className="group cursor-pointer mx-auto max-w-xs sm:max-w-sm glass-panel rounded-2xl p-8 flex flex-col items-center text-center space-y-6 hover:scale-105 transition-transform duration-300 border-pink-400/30 box-glow-pink animate-float-gentle"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500/30 to-rose-400/40 flex items-center justify-center border border-pink-400/40">
                <Mail className="w-12 h-12 text-pink-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg border border-pink-200">
                <Heart className="w-4 h-4 fill-white text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-pink-100">Bức Thư Bí Mật</h3>
              <p className="text-sm text-pink-300/80">Chạm vào phong thư để mở ra điều bất ngờ</p>
            </div>

            <button
              type="button"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-sm shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mở thư ngay</span>
            </button>
          </div>
        ) : (
          // Unfolded Letter Paper & Polaroid Memory Card
          <div className="relative glass-panel rounded-3xl p-6 sm:p-8 max-h-[88vh] overflow-y-auto border-pink-400/40 box-glow-pink animate-in fade-in zoom-in-95 duration-500">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full glass-pill text-pink-300 hover:text-white hover:bg-pink-500/20 transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Letter Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-xs font-serif text-pink-300 uppercase tracking-widest">
                <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                <span>Thư gửi {config.recipientName}</span>
                <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-rose-100">
                Gửi Yêu Dấu Của Em
              </h2>
            </div>

            {/* Letter Body (Parchment Quote) */}
            <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-pink-950/40 to-purple-950/40 border border-pink-500/20 text-pink-100/90 font-serif leading-relaxed text-sm sm:text-base italic shadow-inner">
              <span className="text-3xl text-pink-400 font-serif absolute -top-2 left-3">“</span>
              <p className="pl-4 pr-2">{config.birthdayMessage}</p>
              <span className="text-3xl text-pink-400 font-serif float-right -mt-2">”</span>
            </div>

            {/* Polaroid Frame Memory Photo */}
            <div className="mt-6 flex flex-col items-center">
              <div className="bg-white/95 p-3 sm:p-4 rounded-xl shadow-2xl rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300 max-w-xs border border-pink-200">
                <div className="overflow-hidden rounded-lg aspect-[4/3] bg-pink-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.photoUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80'}
                    alt="Kỷ niệm đẹp"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white backdrop-blur-sm">
                    Forever & Always
                  </div>
                </div>
                <div className="pt-3 pb-1 text-center font-script text-xl text-neutral-800">
                  Chúc anh một tuổi mới luôn hạnh phúc! 💕
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-pink-500/20 flex items-center justify-between gap-3">
              <button
                onClick={onRestart}
                className="px-4 py-2 rounded-xl glass-pill text-xs sm:text-sm text-pink-300 hover:text-white flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Xem lại từ đầu</span>
              </button>

              <button
                onClick={() => {
                  confetti({
                    particleCount: 120,
                    spread: 100,
                    origin: { y: 0.5 },
                  });
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-pink-500/40 transition flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>Thả tim chúc mừng</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
