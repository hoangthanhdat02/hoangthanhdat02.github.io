export type BirthdayStage = 'intro_heart' | 'text_hearts' | 'cake_3d';

export type SceneType = 'intro_heart' | 'text_hearts' | 'cake_3d' | 'gate' | 'particles' | 'cake' | 'sphere' | 'letter';

export interface BirthdayConfig {
  recipientName: string;
  senderName?: string;
  titleText: string;
  subtitleText?: string;
  birthdayMessage?: string;
  photoUrl?: string;
  musicTrackUrl?: string;
}
