'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { romanticAudio } from '@/lib/audio';
import { FloatingBalloonPhoto } from './FloatingBalloonPhoto';

interface BirthdayStageBannerProps {
  onOpenWish: () => void;
  onOpenUniverse?: () => void;
}

const HAPPY_LETTERS = ['H', 'a', 'p', 'p', 'y'];
const BIRTHDAY_LETTERS = ['B', 'i', 'r', 't', 'h', 'd', 'a', 'y'];

export function BirthdayStageBanner({ onOpenWish, onOpenUniverse }: BirthdayStageBannerProps) {
  const happyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const birthdayRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const badgesRef = useRef<HTMLDivElement>(null);

  // Progressive Letter-by-Letter Reveal synchronized with 3D Cake Drawing & Balloon Rise
  useEffect(() => {
    const letters = [...happyRefs.current, ...birthdayRefs.current].filter(Boolean);
    if (letters.length === 0) return;

    // 1. Initial State: hidden, scaled down with slight playful tilt
    gsap.set(letters, {
      scale: 0,
      opacity: 0,
      y: 36,
      rotation: (i) => (i % 2 === 0 ? -14 : 14),
    });

    if (badgesRef.current) {
      gsap.set(badgesRef.current, {
        opacity: 0,
        y: 24,
        scale: 0.88,
      });
    }

    const tl = gsap.timeline({
      delay: 0.35, // Coincides with the magic pen landing on stage
    });

    // 2. "Happy" Letters pop in progressively (0.35s -> 1.6s, matching Plate & Tier 1 creation)
    HAPPY_LETTERS.forEach((_, i) => {
      const el = happyRefs.current[i];
      if (!el) return;

      tl.to(
        el,
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.55,
          ease: 'back.out(2.4)',
          onStart: () => {
            romanticAudio.playPopSound(1.0 + i * 0.08);
          },
        },
        i * 0.28
      );
    });

    const happyEndTime = HAPPY_LETTERS.length * 0.28 + 0.2; // ~1.6s

    // 3. "Birthday" Letters pop in progressively (1.8s -> 4.1s, matching Tier 2, Tier 3, and Topper 16)
    BIRTHDAY_LETTERS.forEach((_, i) => {
      const el = birthdayRefs.current[i];
      if (!el) return;

      tl.to(
        el,
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 0.55,
          ease: 'back.out(2.4)',
          onStart: () => {
            romanticAudio.playPopSound(1.35 + i * 0.06);
          },
        },
        happyEndTime + i * 0.28
      );
    });

    // 4. Sub Badges ("13/10/2010" + Letter Button) pop in triumphantly as candles ignite at ~4.2s
    if (badgesRef.current) {
      tl.to(
        badgesRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: 'back.out(2.0)',
          onStart: () => {
            romanticAudio.playSparkleSound();
          },
        },
        happyEndTime + BIRTHDAY_LETTERS.length * 0.28 + 0.15 // ~4.2s
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Playful Interactive Bouncy Wiggle on Letter Hover
  const handleLetterHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.18,
      rotation: (Math.random() - 0.5) * 16,
      duration: 0.22,
      yoyo: true,
      repeat: 1,
      ease: 'power1.out',
    });
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none overflow-hidden">
      {/* 1. TOP HEADER & ROTATING BIRTHDAY STAMP */}
      <div className="w-full flex items-start justify-between relative pointer-events-none">
        {/* Scattered Stars (Top) */}
        <div className="absolute top-4 left-[38%] text-neutral-800 text-lg select-none opacity-80 animate-pulse">
          ✦
        </div>
        <div className="absolute top-6 left-[58%] text-neutral-800 text-base select-none opacity-80 animate-pulse">
          ✦
        </div>

        {/* Rotating Stamp */}
        <div className="ml-auto hidden sm:block relative top-0 right-2">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#242424] bg-[#ff8595]/90 flex items-center justify-center shadow-md animate-spin-slow">
            <svg className="w-full h-full p-1" viewBox="0 0 100 100">
              <path
                id="circlePath"
                d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                fill="none"
              />
              <text className="text-[10.5px] font-black uppercase tracking-[2px] fill-[#242424]">
                <textPath href="#circlePath" startOffset="0%">
                  • HAPPY BIRTHDAY • HAPPY
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs">
              ❤️
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HERO SECTION: LEFT CHUBBY BUBBLE TYPOGRAPHY & RIGHT BALLOON PHOTO */}
      <div className="flex-1 w-full relative grid grid-cols-1 lg:grid-cols-12 items-start lg:items-center gap-4 sm:gap-6 my-auto pt-2 pb-16">
        {/* LEFT COLUMN: CHUBBY CUTE POPPING TYPOGRAPHY & BADGES (Cols 1-6) */}
        <div className="lg:col-span-6 flex flex-col items-start gap-3 sm:gap-6 pl-1 sm:pl-6 pointer-events-auto z-30 max-w-[calc(100vw-145px)] lg:max-w-none">
          {/* Giant Chubby Bouncy Bubble Typography matching reference */}
          <div className="relative flex flex-col select-none">
            {/* Row 1: "Happy" */}
            <div className="flex items-center relative z-10">
              {HAPPY_LETTERS.map((char, index) => (
                <span
                  key={`h-${index}`}
                  ref={(el) => {
                    happyRefs.current[index] = el;
                  }}
                  onMouseEnter={handleLetterHover}
                  className="bubble-letter-white text-[2.05rem] xs:text-[2.55rem] sm:text-7xl md:text-8xl lg:text-[6.8rem] xl:text-[7.6rem] -mr-[1px] sm:-mr-[3px] md:-mr-[4px] cursor-pointer"
                >
                  {char}
                </span>
              ))}
            </div>

            {/* Row 2: "Birthday" - Tách khoảng cách dòng rõ ràng bên dưới "Happy" */}
            <div className="flex items-center relative z-10 mt-1.5 xs:mt-2.5 sm:mt-5 md:mt-6 lg:mt-7">
              {BIRTHDAY_LETTERS.map((char, index) => (
                <span
                  key={`b-${index}`}
                  ref={(el) => {
                    birthdayRefs.current[index] = el;
                  }}
                  onMouseEnter={handleLetterHover}
                  className="bubble-letter-pink text-[2.05rem] xs:text-[2.55rem] sm:text-7xl md:text-8xl lg:text-[6.8rem] xl:text-[7.6rem] -mr-[1px] sm:-mr-[3px] md:-mr-[4px] cursor-pointer"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Sub Badges matching reference */}
          <div
            ref={badgesRef}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-1 sm:mt-3"
          >
            {/* Date Pill: ★ 13/10/2010 ★ */}
            <div className="bg-[#ff8595] text-neutral-900 border-[2.5px] sm:border-[3.5px] border-[#242424] px-4 sm:px-6 py-1 sm:py-1.5 rounded-full font-black italic tracking-wider text-xs sm:text-lg shadow-[2px_3px_0px_#242424] sm:shadow-[3px_4px_0px_#242424] flex items-center gap-1.5 sm:gap-2">
              <span>★</span>
              <span>13/10/2010</span>
              <span>★</span>
            </div>

            {/* Letter Button: Em nhận thư của anh nè 😘😘 ✉ */}
            <button
              onClick={onOpenWish}
              className="group bg-[#ff8595] text-neutral-900 border-[2.5px] sm:border-[3.5px] border-[#242424] px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-black text-xs sm:text-sm tracking-wide shadow-[2px_3px_0px_#242424] sm:shadow-[3px_4px_0px_#242424] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Em nhận thư của anh nè</span>
              <span>😘😘</span>
              <span className="text-sm">✉️</span>
            </button>
          </div>

          {/* Scattered Stars on Left */}
          <div className="text-neutral-800 text-base sm:text-lg opacity-80 pt-0.5 select-none animate-pulse">
            ✦
          </div>
        </div>

        {/* MIDDLE SPACE (Cols 7-8): Reserved for 3D compact cake sitting below */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* RIGHT COLUMN: FLOATING BALLOONS CARRYING PHOTO OF KHÁNH HUYỀN (Cols 9-12) */}
        <div className="lg:col-span-5 flex justify-end pr-1 sm:pr-8 pointer-events-auto absolute right-1 top-2 sm:top-4 lg:static">
          <FloatingBalloonPhoto />
        </div>
      </div>

      {/* 3. BOTTOM FLOATING STARS */}
      <div className="w-full flex justify-between items-end pb-2 opacity-80">
        <div className="text-neutral-800 text-lg select-none pl-4 animate-pulse">✦</div>
        <div className="text-neutral-800 text-lg select-none pr-8 animate-pulse">✦</div>
      </div>
    </div>
  );
}
