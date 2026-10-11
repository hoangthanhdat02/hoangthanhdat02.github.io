'use client';

import React from 'react';
import { Sparkles, Cake, Heart, Mail, Settings, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { SceneType } from '@/types/birthday';

interface SceneTimelineNavProps {
  currentScene: SceneType;
  onSelectScene: (scene: SceneType) => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  onOpenSettings: () => void;
}

export function SceneTimelineNav({
  currentScene,
  onSelectScene,
  isPlayingMusic,
  onToggleMusic,
  onOpenSettings,
}: SceneTimelineNavProps) {
  if (currentScene === 'gate') return null;

  const scenes: { id: SceneType; label: string; icon: React.ReactNode }[] = [
    { id: 'particles', label: 'Chữ sao', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'cake', label: 'Bánh 3D', icon: <Cake className="w-4 h-4" /> },
    { id: 'sphere', label: 'Cầu tim', icon: <Heart className="w-4 h-4" /> },
    { id: 'letter', label: 'Bức thư', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-30 flex items-center justify-center px-4 pointer-events-none">
      <div className="glass-panel rounded-full p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 shadow-2xl border-pink-500/30 pointer-events-auto">
        {/* Navigation buttons */}
        {scenes.map((s) => {
          const isActive = currentScene === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectScene(s.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 scale-105'
                  : 'text-pink-200/70 hover:text-pink-100 hover:bg-white/10'
              }`}
            >
              {s.icon}
              <span className="hidden xs:inline sm:inline">{s.label}</span>
            </button>
          );
        })}

        <div className="h-5 w-[1px] bg-pink-500/20 mx-1" />

        {/* Music Control */}
        <button
          onClick={onToggleMusic}
          className={`p-2 rounded-full transition-all ${
            isPlayingMusic
              ? 'text-pink-400 bg-pink-500/20 hover:bg-pink-500/30'
              : 'text-neutral-400 hover:text-white bg-white/5'
          }`}
          title={isPlayingMusic ? 'Tắt nhạc' : 'Bật nhạc'}
          aria-label="Toggle music"
        >
          {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Personalization settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full text-pink-200/80 hover:text-white hover:bg-white/10 transition"
          title="Tùy chỉnh thông tin"
          aria-label="Customize"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
