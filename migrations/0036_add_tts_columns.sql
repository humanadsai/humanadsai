-- Add TTS (Text-to-Speech) support columns to video_posts
-- tts_audio_data: base64-encoded MP3 audio from gpt-4o-mini-tts
-- tts_timestamps_json: JSON array of {word, start, end} from Whisper
-- voice_preset: emotion preset used (news_shocking, news_calm, etc.)

ALTER TABLE video_posts ADD COLUMN tts_audio_data TEXT;
ALTER TABLE video_posts ADD COLUMN tts_timestamps_json TEXT;
ALTER TABLE video_posts ADD COLUMN voice_preset TEXT;
