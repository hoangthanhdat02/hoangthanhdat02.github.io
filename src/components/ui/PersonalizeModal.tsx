'use client';

import React, { useState } from 'react';
import { X, Check, Heart, Image as ImageIcon, Sparkles } from 'lucide-react';
import { BirthdayConfig } from '@/types/birthday';

interface PersonalizeModalProps {
  isOpen: boolean;
  config: BirthdayConfig;
  onClose: () => void;
  onSave: (newConfig: BirthdayConfig) => void;
}

export function PersonalizeModal({ isOpen, config, onClose, onSave }: PersonalizeModalProps) {
  const [recipient, setRecipient] = useState(config.recipientName);
  const [title, setTitle] = useState(config.titleText);
  const [message, setMessage] = useState(config.birthdayMessage || '');
  const [photo, setPhoto] = useState(config.photoUrl || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      recipientName: recipient.trim() || 'Người Thương 💖',
      titleText: title.trim() || 'Chúc Mừng Sinh Nhật',
      birthdayMessage: message.trim(),
      photoUrl: photo.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border-pink-400/40 box-glow-pink">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-pill text-pink-300 hover:text-white transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-xs font-serif text-pink-300 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Cá nhân hóa món quà</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-pink-100">Chỉnh Sửa Thông Tin</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-medium text-pink-300 mb-1">
              Tên người nhận (Hiện trên chữ hạt sao & thư)
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="VD: Anh iu 💖, Hoàng Anh, Em iu..."
              className="w-full px-4 py-2.5 rounded-xl bg-pink-950/40 border border-pink-500/30 text-white placeholder-pink-400/40 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pink-300 mb-1">
              Tiêu đề chính
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chúc Mừng Sinh Nhật"
              className="w-full px-4 py-2.5 rounded-xl bg-pink-950/40 border border-pink-500/30 text-white placeholder-pink-400/40 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pink-300 mb-1">
              Lời nhắn gửi trong phong thư
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập lời chúc sinh nhật ấm áp của bạn..."
              className="w-full px-4 py-2.5 rounded-xl bg-pink-950/40 border border-pink-500/30 text-white placeholder-pink-400/40 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-pink-300 mb-1">
              Link ảnh kỷ niệm (URL)
            </label>
            <input
              type="url"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-pink-950/40 border border-pink-500/30 text-white placeholder-pink-400/40 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass-pill text-xs sm:text-sm text-pink-300 hover:text-white transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
