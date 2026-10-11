'use client';

import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Heart, X, Images } from 'lucide-react';
import { CosmicHeartUniverse3D } from './canvas/CosmicHeartUniverse3D';
import { getAssetPath } from '@/lib/basePath';

interface CosmicMemoriesUniverseProps {
  onBack: () => void;
}

// 29 Curated Photos of Khánh Huyền & The Couple (Chỉ thuần ảnh viền trắng, không chữ giới thiệu)
const RAW_GALLERY_PHOTOS = [
  '/images/gallery/memory-25.jpg', // Áo dài đỏ selfie gương tròn cùng bạn thân 🪞❤️
  '/images/gallery/memory-26.jpg', // Áo dài đỏ đội mũ thú hoạt hình siêu đáng yêu 🦊🧢
  '/images/gallery/memory-27.png', // Áo trắng ren & váy vàng chu mỏ tạo dáng peace sign ✌️✨
  '/images/gallery/memory-28.jpg', // Khăn choàng hoa tươi tắn rạng rỡ cùng bạn thân 🌸📸
  '/images/gallery/memory-22.jpg', // Nụ hôn ngọt ngào má em trên nền sao đỏ ❤️
  '/images/gallery/memory-21.jpg', // Dải photobooth 8 khung đôi bạn
  '/images/gallery/memory-14.png', // Ảnh đôi đội mũ thú ngắm nhìn nhau 🐻🐰
  '/images/gallery/memory-15.png', // Ảnh đôi cười tươi nhìn ống kính 💑
  '/images/gallery/memory-23.png', // Tự hào huy chương vàng thể thao 🥇✨
  '/images/gallery/memory-24.png', // Selfie đêm áo khoác adidas rạng rỡ 🌟
  '/images/gallery/memory-20.jpg', // Dáng chụp peace sign bên vách đá biển ✌️🌊
  '/images/gallery/memory-19.jpg', // Ngoại cảnh vách đá du lịch
  '/images/gallery/memory-18.png', // Toàn thân váy trắng trước gương
  '/images/gallery/memory-12.png', // Ngắm ảnh em bé trên laptop ban đêm
  '/images/gallery/memory-11.png', // Selfie áo trắng tay chạm cằm
  '/images/gallery/memory-17.png', // Bắn tim photobooth cùng bạn bè
  '/images/gallery/memory-16.png', // Photobooth bạn bè tạo dáng V
  '/images/gallery/memory-13.png', // Kỷ niệm cùng nhóm bạn thân
  '/images/gallery/memory-1.jpg',  // Váy xanh ngọc bên ban công
  '/images/gallery/memory-2.png',  // Áo khoác denim nụ cười ngọt ngào
  '/images/gallery/memory-3.jpg',  // Áo học sinh photobooth 4 khung
  '/images/gallery/memory-4.png',  // Áo dài đỏ ôm hoa dưới cờ
  '/images/gallery/memory-5.png',  // Nháy mắt filter tai gấu
  '/images/gallery/memory-6.png',  // Chu mỏ tạo dáng peace sign
  '/images/gallery/memory-7.jpg',  // Áo khoác trường ôm hoa dưới nắng
  '/images/gallery/memory-8.jpg',  // 2 khung áo dài đỏ chạm cằm
  '/images/gallery/memory-9.png',  // Áo dài nón lá chụp đêm
  '/images/gallery/memory-10.png', // Áo khoác trường vuốt tóc
  '/images/childhood-photo.png',   // Kỷ niệm tuổi thơ của hai đứa
];

const GALLERY_PHOTOS = RAW_GALLERY_PHOTOS.map(getAssetPath);

// Romantic glowing wishes matching user's love letter & TikTok CapCut trend
const GLOWING_WISHES = [
  'Chúc mừng sinh nhật công chúa của anhhh 🎂❤️',
  'Và thế giới đã mất đi một người cô đơn 💕',
  'Yêu em nhiều hơn mỗi ngày trôi qua 💖',
  'Tuổi mới luôn vui vẻ, bình an và rạng rỡ nhé 🌸',
  'Nụ cười của em là điều ngọt ngào nhất thế gian 🥰',
  'Cảm ơn em vì đã xuất hiện trong cuộc đời anh ✨',
  'Anh không mong gì hơn ngoài việc em luôn hạnh phúc 💫',
  'Có chuyện buồn cứ dựa vào anh nhé 🫶🏻',
  'Bên em là nơi bình yên nhất ❤️',
  'Mãi mãi là cô bé đáng yêu của anh nhé 🌷',
  'Anh sẽ luôn yêu thương em bằng sự chân thành nhất 💖',
  'Chúc cô gái anh thương tất cả những điều tuyệt vời nhất 💐',
  'Happy Birthday My Baby Girl 🎂💗',
  'Tình yêu anh dành cho em vô tận như ngân hà 🌌✨',
  'Yêu cô gái của anh nhiều lắm ❤️',
  'Nụ cười của em là ánh sáng của cuộc đời anh 🌟',
  'Em là điều tuyệt vời nhất từng đến bên anh 💫',
  'Chúc em tuổi mới luôn luôn xinh gái 💖',
  'Chúc em luôn vui vẻ và hạnh phúc nhé 🌸',
  'Tình yêu anh dành cho em vô tận như dải ngân hà 🌌✨',
  'Công chúa nhỏ của anh hãy luôn rạng rỡ nhé 💐',
  'Có anh ở đây rồi, mãi bên em bé của anh 🫶🏻',
  'Happy 16th Birthday Khánh Huyền My Love 🎂❤️',
];

export function CosmicMemoriesUniverse({ onBack }: CosmicMemoriesUniverseProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showAlbumModal, setShowAlbumModal] = useState<boolean>(false);

  // Wheel speed control
  const handleWheel = (e: React.WheelEvent) => {
    setSpeedMultiplier((prev) => {
      const delta = e.deltaY > 0 ? 0.2 : -0.2;
      return Math.max(0.3, Math.min(3.0, prev + delta));
    });
  };

  return (
    <div
      onWheel={handleWheel}
      className="fixed inset-0 z-40 bg-[#06020c] text-white overflow-hidden select-none"
    >
      {/* 1. Live 3D Unified Universe (Cả Trái Tim 3D, Cả Ảnh 3D & Lời Chúc Xoay 360 Độ Cùng Nhau) */}
      <CosmicHeartUniverse3D
        photos={GALLERY_PHOTOS}
        wishes={GLOWING_WISHES}
        isPaused={isPaused}
        speedMultiplier={speedMultiplier}
        onPhotoClick={(src) => setSelectedPhoto(src)}
      />

      {/* Subtle Romantic Cosmic Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(219, 39, 119, 0.15) 0%, transparent 68%),
            radial-gradient(circle at 15% 85%, rgba(139, 92, 246, 0.12) 0%, transparent 62%),
            radial-gradient(circle at 85% 15%, rgba(244, 63, 94, 0.12) 0%, transparent 62%)
          `,
        }}
      />

      {/* 2. Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-2.5 xs:p-3 sm:p-5 bg-gradient-to-b from-[#07030e]/95 via-[#07030e]/60 to-transparent backdrop-blur-[2px] gap-2">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-pink-200 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[11px] xs:text-xs sm:text-sm font-semibold tracking-wide">
            <span className="hidden xs:inline">Quay lại </span>Bánh Kem
          </span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-1.5 text-center pointer-events-none min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse hidden md:inline-block flex-shrink-0" />
          <h1 className="font-script text-sm xs:text-base sm:text-2xl md:text-[2rem] font-bold text-pink-200 drop-shadow-[0_0_15px_rgba(255,105,180,0.7)] tracking-wide truncate">
            Vũ Trụ Kỷ Niệm Của Chúng Mình 💖
          </h1>
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse hidden md:inline-block flex-shrink-0" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setShowAlbumModal(true)}
            className="px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-pink-200 hover:text-white text-[11px] xs:text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md flex items-center gap-1"
            title="Xem toàn bộ ảnh"
          >
            <Images className="w-3.5 h-3.5 text-pink-300" />
            <span><span className="hidden xs:inline">Album </span>({GALLERY_PHOTOS.length})</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pink-500/25 hover:bg-pink-500/40 border border-pink-400/50 text-pink-200 text-[11px] xs:text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer backdrop-blur-md shadow-md flex items-center gap-1"
          >
            <span>{isPaused ? '▶' : '⏸'}</span>
            <span className="hidden sm:inline">{isPaused ? ' Tiếp tục' : ' Tạm dừng'}</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom Hint Helper */}
      <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 pointer-events-none flex items-center justify-center px-3 sm:px-4 z-40">
        <div className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-[10px] xs:text-[11px] sm:text-xs text-pink-200/90 flex items-center gap-1.5 sm:gap-2 shadow-lg text-center">
          <Heart className="w-3 h-3 text-pink-400 fill-pink-400 animate-pulse flex-shrink-0" />
          <span className="sm:hidden">Chạm vuốt để xoay 360° • Bấm ảnh để phóng to ✨</span>
          <span className="hidden sm:inline">Kéo chuột hoặc chạm vuốt để xoay cả ảnh & vũ trụ 360° • Cuộn chuột chỉnh tốc độ • Bấm ảnh để phóng to</span>
        </div>
      </div>

      {/* 4. Fullscreen Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[92vw] max-h-[88vh] bg-white p-2.5 sm:p-3.5 rounded-[18px] shadow-[0_25px_65px_rgba(255,105,180,0.4)] cursor-default"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-white flex items-center justify-center transition-all cursor-pointer z-10 shadow-md border border-white/20"
              aria-label="Đóng ảnh"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="max-w-[560px] max-h-[78vh] overflow-hidden rounded-[12px] bg-neutral-900 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto}
                alt="Ảnh kỷ niệm phóng to"
                className="w-full h-full object-contain max-h-[78vh] rounded-[12px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. All Photos Album Grid Modal */}
      {showAlbumModal && (
        <div
          onClick={() => setShowAlbumModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[88vh] bg-[#0f091a] border border-pink-500/30 rounded-[24px] p-4 sm:p-6 shadow-[0_20px_50px_rgba(255,105,180,0.3)] flex flex-col cursor-default"
          >
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-pink-400" />
                <h3 className="text-base sm:text-lg font-bold text-pink-200">
                  Trọn bộ {GALLERY_PHOTOS.length} Bức Ảnh Kỷ Niệm Của Chúng Mình 💖
                </h3>
              </div>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
                aria-label="Đóng album"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of All Photos */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {GALLERY_PHOTOS.map((src, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedPhoto(src);
                  }}
                  className="group relative aspect-[3/4] bg-neutral-900 rounded-[12px] p-1.5 border-2 border-white/80 hover:border-pink-400 hover:scale-103 transition-all duration-300 cursor-pointer shadow-md overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Ảnh kỷ niệm ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-[8px] group-hover:scale-108 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-pink-200 font-mono">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-neutral-400 mt-3 pt-2 border-t border-white/10">
              Nhấp vào bất kỳ ảnh nào để phóng to toàn màn hình • Tổng cộng {GALLERY_PHOTOS.length} khoảnh khắc
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
