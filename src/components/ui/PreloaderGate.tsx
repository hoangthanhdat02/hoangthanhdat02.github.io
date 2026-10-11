'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, Sparkles, ChevronRight } from 'lucide-react';
import { romanticAudio } from '@/lib/audio';

interface PreloaderGateProps {
  onUnlock: () => void;
  recipientName: string;
}

export function PreloaderGate({ onUnlock, recipientName }: PreloaderGateProps) {
  const [dragProgress, setDragProgress] = useState(0); // 0 to 100
  const [isUnlocked, setIsUnlocked] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = () => {
    isDraggingRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const handleWidth = 56;
    const maxDist = rect.width - handleWidth;
    const currentX = e.clientX - rect.left - handleWidth / 2;
    const progress = Math.max(0, Math.min(100, (currentX / maxDist) * 100));
    setDragProgress(progress);

    if (progress >= 85 && !isUnlocked) {
      completeUnlock();
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (dragProgress < 85 && !isUnlocked) {
      // Snap back if released prematurely
      setDragProgress(0);
    }
  };

  const completeUnlock = () => {
    setIsUnlocked(true);
    setDragProgress(100);
    // Safe Audio Autoplay Unlock on user gesture
    romanticAudio.playMusic();
    setTimeout(() => {
      onUnlock();
    }, 450);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-10 pointer-events-auto bg-gradient-to-b from-[#05020a]/80 via-transparent to-[#05020a]/90 backdrop-blur-[2px]">
      {/* Top Header */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-xs sm:text-sm tracking-widest text-pink-200/90 uppercase font-medium animate-pulse-glow">
        <Sparkles className="w-4 h-4 text-pink-400" />
        <span>Chạm vào đây để mở điều kỳ diệu</span>
        <Sparkles className="w-4 h-4 text-pink-400" />
      </div>

      {/* Center Heart Emblem & Warm Intro */}
      <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-6">
        <div className="relative group cursor-pointer" onClick={completeUnlock}>
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full blur-xl opacity-40 group-hover:opacity-75 transition duration-700 animate-pulse-glow" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full glass-panel flex items-center justify-center border-2 border-pink-400/40 shadow-2xl">
            <Heart className="w-14 h-14 sm:w-16 sm:h-16 text-pink-400 fill-pink-500/80 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-300 to-pink-100 font-bold tracking-tight">
            Một Món Quà Bất Ngờ
          </h1>
          <p className="text-pink-200/80 text-sm sm:text-base font-light px-4">
            Dành riêng cho <span className="font-semibold text-pink-300">{recipientName}</span> vào ngày đặc biệt này ✨
          </p>
        </div>
      </div>

      {/* Bottom Interactive Slide-to-Unlock Control */}
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center space-y-3">
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full h-14 rounded-full glass-panel p-1 border border-pink-500/30 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Track Fill Progress */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-pink-600/50 to-rose-500/60 rounded-full transition-all duration-75"
            style={{ width: `${Math.max(14, dragProgress)}%` }}
          />

          {/* Central Hint Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs sm:text-sm font-medium tracking-wide text-pink-200/90 gap-1.5">
            <span>Gạt sang phải để bắt đầu</span>
            <ChevronRight className="w-4 h-4 animate-pulse text-pink-300" />
          </div>

          {/* Draggable Knob */}
          <div
            className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-300 flex items-center justify-center text-white shadow-lg border border-pink-200/50 transition-all duration-75"
            style={{ transform: `translateX(${(dragProgress / 100) * (trackRef.current ? trackRef.current.clientWidth - 56 : 240)}px)` }}
          >
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
        </div>

        <button
          onClick={completeUnlock}
          className="text-xs text-pink-300/70 hover:text-pink-200 underline underline-offset-4 transition py-1"
        >
          Hoặc bấm vào đây để mở ngay
        </button>
      </div>
    </div>
  );
}
