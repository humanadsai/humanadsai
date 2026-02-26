import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { WordTimestamp } from '../../schemas';

interface SubtitleLayerProps {
  timestamps: WordTimestamp[];
  style?: 'karaoke' | 'fade' | 'none';
}

/**
 * Karaoke-style subtitle overlay.
 * - Current word: gold, scale(1.05)
 * - Already read: white
 * - Upcoming: white at 50% opacity
 * - Black text stroke + shadow for readability on any background
 */
export const SubtitleLayer: React.FC<SubtitleLayerProps> = ({
  timestamps,
  style = 'karaoke',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (style === 'none' || timestamps.length === 0) return null;

  const currentTimeSec = frame / fps;

  // Group words into lines of ~8 words for display
  const lines = groupWordsIntoLines(timestamps, 8);

  // Find which line group is currently active
  const activeLineIndex = lines.findIndex(
    (line) => currentTimeSec >= line[0].start && currentTimeSec <= line[line.length - 1].end + 0.5,
  );

  // Show the active line, or the next upcoming line
  const displayLineIndex = activeLineIndex >= 0
    ? activeLineIndex
    : lines.findIndex((line) => line[0].start > currentTimeSec);

  if (displayLineIndex < 0) return null;

  const displayLine = lines[displayLineIndex];

  // Fade in/out for the line group
  const lineStart = displayLine[0].start;
  const lineEnd = displayLine[displayLine.length - 1].end;
  const opacity = interpolate(
    currentTimeSec,
    [lineStart - 0.2, lineStart, lineEnd, lineEnd + 0.3],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          left: 40,
          right: 40,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px 8px',
          opacity,
        }}
      >
        {displayLine.map((word, i) => {
          const isCurrent = currentTimeSec >= word.start && currentTimeSec < word.end;
          const isPast = currentTimeSec >= word.end;
          const isFuture = currentTimeSec < word.start;

          let color = 'rgba(255, 255, 255, 0.5)'; // future: dim
          let scale = 1;
          let fontWeight: React.CSSProperties['fontWeight'] = 700;

          if (style === 'karaoke') {
            if (isCurrent) {
              color = '#FFD700'; // gold
              scale = 1.05;
              fontWeight = 900;
            } else if (isPast) {
              color = '#FFFFFF';
              fontWeight = 700;
            }
          } else if (style === 'fade') {
            // Fade style: words appear one by one
            const wordOpacity = isFuture ? 0 : isPast ? 1 : interpolate(
              currentTimeSec,
              [word.start, word.start + 0.15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            );
            color = `rgba(255, 255, 255, ${wordOpacity})`;
          }

          return (
            <span
              key={`${word.start}-${i}`}
              style={{
                fontSize: 52,
                fontWeight,
                color,
                transform: `scale(${scale})`,
                transition: 'transform 0.1s ease',
                textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)',
                WebkitTextStroke: '1.5px rgba(0,0,0,0.6)',
                paintOrder: 'stroke fill',
                lineHeight: 1.4,
              }}
            >
              {word.word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Group sequential words into display lines of maxWords each.
 * Respects natural breaks at punctuation (。、！？).
 */
function groupWordsIntoLines(
  words: WordTimestamp[],
  maxWords: number,
): WordTimestamp[][] {
  const lines: WordTimestamp[][] = [];
  let current: WordTimestamp[] = [];

  for (const word of words) {
    current.push(word);

    const endsWithPunctuation = /[。、！？!?,.]$/.test(word.word);
    if (current.length >= maxWords || endsWithPunctuation) {
      lines.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}
