'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { romanticAudio } from '@/lib/audio';
import { getAssetPath } from '@/lib/basePath';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

export function FloatingBalloonPhoto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftBalloonGroupRef = useRef<SVGGElement>(null);
  const rightBalloonGroupRef = useRef<SVGGElement>(null);
  const frameGroupRef = useRef<SVGGElement>(null);

  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [bounceLeft, setBounceLeft] = useState(false);
  const [bounceRight, setBounceRight] = useState(false);

  // Play Slow Romantic Buoyant Pull-Up Animation (~6.5s duration)
  // When it arrives at its destination, it stays permanently fixed in place (no bobbing up/down)
  const playFlyUpAnimation = useCallback(() => {
    if (!containerRef.current) return;

    gsap.killTweensOf(containerRef.current);

    // Initial position: far below the bottom edge of the screen
    const startY = typeof window !== 'undefined' ? window.innerHeight + 300 : 1300;

    gsap.set(containerRef.current, {
      y: startY,
      x: -10,
      rotation: -3,
      opacity: 0,
      scale: 0.96,
    });

    const tl = gsap.timeline({
      delay: 0.1,
    });

    // 1. Gentle fade in as it emerges from below
    tl.to(
      containerRef.current,
      {
        opacity: 1,
        duration: 1.2,
        ease: 'power1.out',
      },
      0
    );

    // 2. Slow, dreamy buoyant ascension (6.5s) creating the gentle floating balloon sensation
    tl.to(
      containerRef.current,
      {
        y: 0,
        scale: 1,
        duration: 6.5,
        ease: 'sine.out', // Airy, weightless deceleration into place
      },
      0
    );

    // 3. Gentle horizontal drift while rising (simulating natural air currents)
    tl.to(
      containerRef.current,
      {
        x: 10,
        duration: 2.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 2,
      },
      0
    );

    // 4. Straighten out rotation softly as it settles
    tl.to(
      containerRef.current,
      {
        rotation: 0,
        x: 0,
        duration: 3.5,
        ease: 'sine.out',
      },
      3.0
    );
  }, []);

  // Launch on mount
  useEffect(() => {
    playFlyUpAnimation();

    return () => {
      if (containerRef.current) gsap.killTweensOf(containerRef.current);
    };
  }, [playFlyUpAnimation]);

  // Spawn mini floating heart sparkles on balloon tap/click
  const triggerBalloonInteraction = useCallback(
    (e: React.MouseEvent, side: 'left' | 'right') => {
      e.stopPropagation();
      romanticAudio.playSparkleSound();

      if (side === 'left') {
        setBounceLeft(true);
        setTimeout(() => setBounceLeft(false), 500);
      } else {
        setBounceRight(true);
        setTimeout(() => setBounceRight(false), 500);
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = containerRef.current?.getBoundingClientRect() || rect;
      const originX = rect.left + rect.width / 2 - parentRect.left;
      const originY = rect.top + rect.height / 3 - parentRect.top;

      const colors = ['#ff6584', '#ff8595', '#ffa1b5', '#ffd1dc', '#ff4081'];
      const newHearts: FloatingHeart[] = Array.from({ length: 4 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        x: originX + (Math.random() * 40 - 20),
        y: originY + (Math.random() * 20 - 10),
        rotation: Math.random() * 40 - 20,
        scale: 0.8 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));

      setHearts((prev) => [...prev, ...newHearts]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 1500);
    },
    []
  );

  return (
    <div className="relative pointer-events-auto flex flex-col items-center select-none">
      {/* Outer GSAP Animated Container: Floats slowly up over 6.5s and stays fixed */}
      <div
        ref={containerRef}
        style={{ opacity: 0, transform: 'translateY(115vh)' }}
        className="relative flex flex-col items-center"
      >
        {/* Main Unified SVG Composition: Balloons, Strings, Ribbon Anchors, Frame & Tails */}
        <div className="relative w-[125px] xs:w-[150px] sm:w-[320px] md:w-[360px] lg:w-[380px] aspect-[380/440]">
          <svg
            viewBox="0 0 380 440"
            className="w-full h-full overflow-visible select-none"
          >
            <defs>
              {/* Circular clipping path for portrait photo */}
              <clipPath id="birthdayAvatarClip">
                <circle cx="190" cy="230" r="131" />
              </clipPath>

              {/* Pop-art drop shadow filter */}
              <filter id="popShadow" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="3" dy="4" stdDeviation="0" floodColor="#242424" />
              </filter>
            </defs>

            {/* 1. SUSPENDED PHOTO FRAME */}
            <g ref={frameGroupRef}>
              {/* Pop-art solid offset black drop shadow behind circle */}
              <circle cx="196" cy="238" r="135" fill="#242424" />

              {/* Photo background base */}
              <circle cx="190" cy="230" r="135" fill="#ffe4ea" />

              {/* Khánh Huyền Birthday Portrait Image */}
              <image
                href={getAssetPath('/images/birthday-avatar.png')}
                xlinkHref={getAssetPath('/images/birthday-avatar.png')}
                x="55"
                y="95"
                width="270"
                height="270"
                clipPath="url(#birthdayAvatarClip)"
                preserveAspectRatio="xMidYMid slice"
              />

              {/* Thick pop-art cartoon black border around circle */}
              <circle
                cx="190"
                cy="230"
                r="135"
                fill="none"
                stroke="#242424"
                strokeWidth="9"
              />

              {/* Inner subtle rim highlight */}
              <circle
                cx="190"
                cy="230"
                r="129"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="2"
              />
            </g>

            {/* 2. BALLOON STRINGS & CURLING RIBBON TAILS */}
            {/* LEFT STRING (From Left Balloon to Left Rim Anchor at 87, 143) */}
            <g>
              {/* Main tension string from balloon knot to frame */}
              <path
                d="M 75,98 Q 71,120 87,143"
                stroke="#242424"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 75,98 Q 71,120 87,143"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />

              {/* Curling ribbon tail dangling down along left curve of frame */}
              <path
                d="M 87,143 Q 62,172 72,208 Q 82,244 64,280 Q 52,305 64,330"
                stroke="#242424"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 87,143 Q 62,172 72,208 Q 82,244 64,280 Q 52,305 64,330"
                stroke="#ff94a8"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />

              {/* Ribbon Bow Knot right ON the Frame Border at (87, 143) */}
              <g transform="translate(87, 143)">
                <ellipse cx="0" cy="0" rx="5.5" ry="5.5" fill="#242424" />
                {/* Left bow loop */}
                <path
                  d="M 0,0 C -16,-14 -20,-2 0,0"
                  fill="#ff8595"
                  stroke="#242424"
                  strokeWidth="2.5"
                />
                {/* Right bow loop */}
                <path
                  d="M 0,0 C 16,-14 20,-2 0,0"
                  fill="#ff8595"
                  stroke="#242424"
                  strokeWidth="2.5"
                />
                <circle cx="0" cy="0" r="3.5" fill="#ff6584" />
              </g>
            </g>

            {/* RIGHT STRING (From Right Balloon to Right Rim Anchor at 293, 143) */}
            <g>
              {/* Main tension string from balloon knot to frame */}
              <path
                d="M 305,96 Q 309,120 293,143"
                stroke="#242424"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 305,96 Q 309,120 293,143"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />

              {/* Curling ribbon tail dangling down along right curve of frame */}
              <path
                d="M 293,143 Q 318,172 308,208 Q 298,244 316,280 Q 328,305 316,330"
                stroke="#242424"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 293,143 Q 318,172 308,208 Q 298,244 316,280 Q 328,305 316,330"
                stroke="#ff6e85"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />

              {/* Ribbon Bow Knot right ON the Frame Border at (293, 143) */}
              <g transform="translate(293, 143)">
                <ellipse cx="0" cy="0" rx="5.5" ry="5.5" fill="#242424" />
                {/* Left bow loop */}
                <path
                  d="M 0,0 C -16,-14 -20,-2 0,0"
                  fill="#ff6e85"
                  stroke="#242424"
                  strokeWidth="2.5"
                />
                {/* Right bow loop */}
                <path
                  d="M 0,0 C 16,-14 20,-2 0,0"
                  fill="#ff6e85"
                  stroke="#242424"
                  strokeWidth="2.5"
                />
                <circle cx="0" cy="0" r="3.5" fill="#ff4081" />
              </g>
            </g>

            {/* 3. BALLOON 1 (TOP-LEFT SWEET PINK BALLOON) */}
            <g
              ref={leftBalloonGroupRef}
              className={`cursor-pointer transition-transform duration-300 ${
                bounceLeft ? 'scale-110' : 'hover:scale-105'
              }`}
              onClick={(e) => triggerBalloonInteraction(e, 'left')}
            >
              {/* Balloon Drop Shadow */}
              <ellipse
                cx="78"
                cy="54"
                rx="40"
                ry="50"
                fill="rgba(0,0,0,0.18)"
              />

              {/* Balloon Body (Sweet Rose Pink) */}
              <ellipse
                cx="75"
                cy="48"
                rx="40"
                ry="50"
                fill="#ff94a8"
                stroke="#242424"
                strokeWidth="4.5"
              />

              {/* Pop-art Black Glossy Arc */}
              <path
                d="M 50,28 Q 42,50 51,72"
                stroke="#242424"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* White Inner Glossy Sheen */}
              <path
                d="M 57,30 Q 50,50 58,70"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* White Circular Sparkle Highlight */}
              <circle cx="63" cy="24" r="4" fill="#ffffff" />

              {/* Balloon Knot at bottom */}
              <polygon
                points="75,98 66,106 84,106"
                fill="#ff94a8"
                stroke="#242424"
                strokeWidth="3.5"
              />
              <circle cx="75,103" r="3" fill="#242424" />
            </g>

            {/* 4. BALLOON 2 (TOP-RIGHT CORAL ROSE BALLOON) */}
            <g
              ref={rightBalloonGroupRef}
              className={`cursor-pointer transition-transform duration-300 ${
                bounceRight ? 'scale-110' : 'hover:scale-105'
              }`}
              onClick={(e) => triggerBalloonInteraction(e, 'right')}
            >
              {/* Balloon Drop Shadow */}
              <ellipse
                cx="308"
                cy="50"
                rx="42"
                ry="52"
                fill="rgba(0,0,0,0.18)"
              />

              {/* Balloon Body (Coral Rose Pink) */}
              <ellipse
                cx="305"
                cy="44"
                rx="42"
                ry="52"
                fill="#ff6e85"
                stroke="#242424"
                strokeWidth="4.5"
              />

              {/* Pop-art Black Glossy Arc */}
              <path
                d="M 330,24 Q 338,46 332,68"
                stroke="#242424"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* White Inner Glossy Sheen */}
              <path
                d="M 323,26 Q 330,46 325,66"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* White Circular Sparkle Highlight */}
              <circle cx="317" cy="20" r="4.5" fill="#ffffff" />

              {/* Balloon Knot at bottom */}
              <polygon
                points="305,96 296,104 314,104"
                fill="#ff6e85"
                stroke="#242424"
                strokeWidth="3.5"
              />
              <circle cx="305,101" r="3" fill="#242424" />
            </g>
          </svg>

          {/* 5. PILL BADGE UNDERNEATH: ♥ Khánh Huyền ♥ (Clean, Fixed Display) */}
          <div className="absolute -bottom-3 sm:-bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-auto">
            <div
              className="bg-[#ff8595] text-neutral-900 border-[2px] sm:border-[3.5px] border-[#242424] px-3 sm:px-7 py-0.5 sm:py-1.5 rounded-full font-black italic tracking-wide text-[10px] xs:text-xs sm:text-base md:text-lg shadow-[2px_2px_0px_#242424] sm:shadow-[3px_4px_0px_#242424] flex items-center gap-1 sm:gap-2 select-none"
            >
              <span className="text-red-600 text-xs sm:text-sm animate-pulse">♥</span>
              <span>Khánh Huyền</span>
              <span className="text-red-600 text-xs sm:text-sm animate-pulse">♥</span>
            </div>
          </div>
        </div>

        {/* Interactive Floating Sparkle Hearts on Balloon Click */}
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute pointer-events-none z-50 animate-float-particle"
            style={
              {
                left: `${heart.x}px`,
                top: `${heart.y}px`,
                '--tx': `${(Math.random() - 0.5) * 60}px`,
                '--tr': `${heart.rotation}deg`,
                color: heart.color,
                transform: `scale(${heart.scale})`,
              } as React.CSSProperties
            }
          >
            <span className="text-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">💖</span>
          </div>
        ))}
      </div>
    </div>
  );
}
