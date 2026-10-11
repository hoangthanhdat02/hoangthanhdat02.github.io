'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BirthdayWishCardModalProps {
  onClose: () => void;
  onOpenUniverse?: () => void;
}

export function BirthdayWishCardModal({ onClose, onOpenUniverse }: BirthdayWishCardModalProps) {
  const [extraHearts, setExtraHearts] = useState<{ id: number; x: number; rot: number; icon: string }[]>([]);

  // Fire gentle celebratory confetti upon opening the letter
  React.useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#ff6b8b', '#ff85a2', '#fbcfe8', '#ffd166', '#ffffff'],
    });
  }, []);

  // Click on bunny triggers extra shooting hearts burst
  const handleBunnyClick = () => {
    const icons = ['💖', '💕', '❤️', '💓', '💗'];
    const newItems = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 45,
      rot: (Math.random() - 0.5) * 40,
      icon: icons[Math.floor(Math.random() * icons.length)],
    }));
    setExtraHearts((prev) => [...prev.slice(-8), ...newItems]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md transition-all animate-fade-in pointer-events-auto">
      {/* Backdrop dismissal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Vintage Cream Letter Card */}
      <div className="relative z-10 w-full max-w-[1160px] xl:max-w-[1240px] bg-[#fffcf0] rounded-[24px] sm:rounded-[36px] border-2 sm:border-3 border-[#f2e9dc] p-4 sm:p-7 md:p-8 lg:p-9 pb-6 sm:pb-10 md:pb-11 lg:pb-12 shadow-[0_25px_65px_rgba(0,0,0,0.5)] overflow-hidden max-h-[92vh] overflow-y-auto overscroll-contain select-none">
        {/* Subtle Notebook Paper Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(240, 215, 222, 0.45) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(240, 215, 222, 0.45) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Close Button X (Top-right corner) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 border border-neutral-300 shadow-md flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer"
          aria-label="Đóng thư"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Title */}
        <div className="relative z-10 text-center mb-4 sm:mb-6">
          <h2 className="font-script text-2xl sm:text-3xl md:text-[2.5rem] font-bold text-[#2a201e] flex items-center justify-center gap-2 sm:gap-3 tracking-wide">
            <span>Đôi lời gửi tới Em Bé Của Anh</span>
            <span className="text-xl sm:text-2xl">💕</span>
            <span className="text-xl sm:text-2xl">❤️</span>
          </h2>
        </div>

        {/* Main 3-Column Content Body */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-4 sm:gap-6 lg:gap-7">
          {/* Visual Pair Container: Side-by-side on mobile, individual columns on desktop */}
          <div className="flex flex-row lg:contents items-center justify-center gap-3 sm:gap-6 w-full lg:w-auto">
            {/* Column 1: Romantic Two Hearts Pierced with Arrow */}
            <div className="flex items-center justify-center w-36 xs:w-44 sm:w-56 lg:w-[250px] xl:w-[270px] flex-shrink-0 order-2 lg:order-1">
              <div className="relative group animate-float-gentle">
                <svg
                  viewBox="0 0 340 230"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-[0_8px_16px_rgba(255,105,135,0.2)]"
                >
                  {/* Ribbon banner underneath */}
                  <path
                    d="M25 185 Q80 160 160 180 T305 175 L285 205 Q220 200 150 215 T45 210 Z"
                    fill="#ded5c7"
                    opacity="0.85"
                  />
                  <path d="M45 210 L25 185 L55 190 Z" fill="#cfc4b4" />

                  {/* Back Arrow Shaft & Fletching */}
                  <line x1="285" y1="35" x2="190" y2="90" stroke="#968877" strokeWidth="7" strokeLinecap="round" />
                  <path d="M285 35 L300 25 L290 45 Z" fill="#8c7e6d" />
                  <path d="M275 40 L290 30 L280 50 Z" fill="#8c7e6d" />

                  {/* Back Heart (Top-Right) */}
                  <g transform="translate(190, 95) rotate(12)">
                    <path
                      d="M0 -35 C22 -70, 72 -48, 65 0 C60 38, 0 68, 0 72 C0 68, -60 38, -65 0 C-72 -48, -22 -70, 0 -35 Z"
                      fill="#e84368"
                      stroke="#ffffff"
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Arrow Shaft (between hearts) */}
                  <line x1="180" y1="100" x2="135" y2="128" stroke="#968877" strokeWidth="7" strokeLinecap="round" />

                  {/* Front Heart (Bottom-Left) */}
                  <g transform="translate(115, 138) rotate(-18)">
                    <path
                      d="M0 -32 C20 -64, 66 -44, 60 0 C55 35, 0 62, 0 66 C0 62, -55 35, -60 0 C-66 -44, -20 -64, 0 -32 Z"
                      fill="#ee4d72"
                      stroke="#ffffff"
                      strokeWidth="5"
                      strokeLinejoin="round"
                    />
                  </g>

                  {/* Front Arrow Shaft & Head */}
                  <line x1="100" y1="148" x2="48" y2="178" stroke="#968877" strokeWidth="7" strokeLinecap="round" />
                  <polygon points="32,187 54,168 45,190" fill="#8c7e6d" />
                </svg>
              </div>
            </div>

            {/* Column 2: Oval Childhood Photo Frame */}
            <div className="flex items-center justify-center w-28 xs:w-36 sm:w-52 lg:w-[225px] xl:w-[245px] flex-shrink-0 order-1 lg:order-2">
              <div className="relative w-28 xs:w-36 sm:w-48 lg:w-[215px] xl:w-[235px] h-38 xs:h-48 sm:h-64 lg:h-[295px] xl:h-[325px] rounded-[50%] overflow-hidden border-[3.5px] sm:border-[5px] border-white shadow-[0_10px_24px_rgba(0,0,0,0.2)] bg-[#eae4da] group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/childhood-photo.png"
                  alt="Kỷ niệm tuổi thơ"
                  className="w-full h-full object-cover object-[center_20%] scale-110 group-hover:scale-118 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Subtle Vertical Vintage Divider */}
          <div className="hidden lg:block w-[1.5px] bg-[#e8ded2] self-stretch mx-1 rounded-full opacity-80" />

          {/* Column 3: Heartfelt Letter Text & Animated Stickers */}
          <div className="w-full lg:flex-1 flex flex-col justify-between pl-0 lg:pl-3 min-w-0 order-3">
            {/* Heartfelt Letter Text */}
            <div className="space-y-2 sm:space-y-2.5">
              <h3 className="font-script text-xl sm:text-2xl md:text-[1.45rem] font-bold text-[#b83252] leading-snug">
                Chúc mừng sinh nhật em bé của anh ❤️🎂💗
              </h3>

              <p className="font-script text-[#251b1b] text-base sm:text-[1.08rem] md:text-[1.12rem] leading-[1.6] sm:leading-[1.65] font-semibold text-justify">
                Chúc em tuổi mới luôn vui vẻ, xinh đẹp, bình an và gặp thật nhiều điều may mắn. Mong rằng những điều tốt đẹp nhất sẽ đến với em, những muộn phiền sẽ dần qua đi và nụ cười sẽ luôn ở trên môi em. Anh không mong gì hơn ngoài việc em luôn hạnh phúc, được yêu thương và có thể thoải mái làm những điều mình thích.
              </p>

              <p className="font-script text-[#251b1b] text-base sm:text-[1.08rem] md:text-[1.12rem] leading-[1.6] sm:leading-[1.65] font-semibold text-justify">
                Cảm ơn em vì đã xuất hiện trong cuộc đời anh, để anh có thêm một người để thương, để nhớ và để cố gắng mỗi ngày. Anh biết mình không phải lúc nào cũng hoàn hảo, cũng chẳng thể hứa sẽ khiến em vui mọi lúc, nhưng anh sẽ luôn cố gắng yêu thương em bằng sự chân thành của mình. Mong rằng những sinh nhật sau này, anh vẫn có thể ở bên em, cùng em thổi nến, đón tuổi mới và tạo nên thật nhiều kỷ niệm đẹp.
              </p>

              <p className="font-script text-[#251b1b] text-base sm:text-[1.08rem] md:text-[1.12rem] leading-[1.6] sm:leading-[1.65] font-semibold text-justify">
                Tuổi mới rồi, hãy cứ là cô gái đáng yêu của anh nhé. Có chuyện gì vui thì kể anh nghe, có chuyện gì buồn thì cứ dựa vào anh. Chúc cô gái anh thương tất cả những điều tốt đẹp nhất trên thế gian này. Yêu em nhiều lắm, sinh nhật vui vẻ nhé, em bé của anh! 🫶🏻💐❤️
              </p>
            </div>

            {/* Animated Stickers Row (Đẩy lên cao hơn, có khoảng cách thoáng đẹp với viền dưới) */}
            <div className="flex items-end justify-between px-4 sm:px-8 pt-3 pb-4 sm:pb-6 -translate-y-2 sm:-translate-y-4">
              {/* Animated Sticker 1: Quby holding giant sunflower bouquet */}
              <div className="relative group cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/sticker-sunflower.png"
                  alt="Sticker Sunflower"
                  className="w-20 sm:w-22 md:w-24 h-auto drop-shadow-md animate-chibi-bounce hover:scale-115 transition-transform"
                />
                {/* Floating Sunflower Sparkle */}
                <span className="absolute -top-2 right-1 text-xs animate-bounce opacity-80 pointer-events-none select-none">🌻</span>
              </div>

              {/* Animated Sticker 2: Bunny dancing happily with Active Shooting Hearts Fountain */}
              <div
                onClick={handleBunnyClick}
                className="relative group cursor-pointer flex flex-col items-center"
                title="Bấm vào chú thỏ để bắn thêm tim! 💖"
              >
                {/* Continuous Shooting Hearts Stream */}
                <span
                  className="animate-shoot-heart absolute top-0 left-1/2 text-sm sm:text-base pointer-events-none select-none"
                  style={{ animationDelay: '0s', ['--hx' as unknown as string]: '-16px', ['--hr' as unknown as string]: '-18deg' } as React.CSSProperties}
                >
                  💖
                </span>
                <span
                  className="animate-shoot-heart absolute top-0 left-1/2 text-sm sm:text-base pointer-events-none select-none"
                  style={{ animationDelay: '0.45s', ['--hx' as unknown as string]: '16px', ['--hr' as unknown as string]: '20deg' } as React.CSSProperties}
                >
                  💕
                </span>
                <span
                  className="animate-shoot-heart absolute top-0 left-1/2 text-sm sm:text-base pointer-events-none select-none"
                  style={{ animationDelay: '0.9s', ['--hx' as unknown as string]: '-6px', ['--hr' as unknown as string]: '-25deg' } as React.CSSProperties}
                >
                  ❤️
                </span>
                <span
                  className="animate-shoot-heart absolute top-0 left-1/2 text-sm sm:text-base pointer-events-none select-none"
                  style={{ animationDelay: '1.35s', ['--hx' as unknown as string]: '22px', ['--hr' as unknown as string]: '15deg' } as React.CSSProperties}
                >
                  💓
                </span>
                <span
                  className="animate-shoot-heart absolute top-0 left-1/2 text-sm sm:text-base pointer-events-none select-none"
                  style={{ animationDelay: '1.8s', ['--hx' as unknown as string]: '-20px', ['--hr' as unknown as string]: '-12deg' } as React.CSSProperties}
                >
                  💖
                </span>

                {/* Extra dynamic click burst hearts */}
                {extraHearts.map((h) => (
                  <span
                    key={h.id}
                    className="animate-shoot-heart absolute top-0 left-1/2 text-base pointer-events-none select-none"
                    style={{ ['--hx' as unknown as string]: `${h.x}px`, ['--hr' as unknown as string]: `${h.rot}deg` } as React.CSSProperties}
                  >
                    {h.icon}
                  </span>
                ))}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/sticker-bunny.png"
                  alt="Sticker Bunny Dancing"
                  className="w-16 sm:w-18 md:w-20 h-auto drop-shadow-md animate-bunny-dance hover:scale-115 transition-transform"
                />
              </div>
            </div>

            {/* Quick Link to Galaxy Memories */}
            {onOpenUniverse && (
              <div className="flex justify-center -mt-1 sm:-mt-2 pb-1">
                <button
                  onClick={onOpenUniverse}
                  className="group px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-pink-300/40"
                >
                  <span>Khám phá Vũ Trụ Kỷ Niệm của chúng mình</span>
                  <span className="text-sm sm:text-base">🌌✨</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
