import React from 'react';

interface EmphasisTextProps {
  text: string;
  emphasisWords?: string[];
  accentColor?: string;
}

/**
 * Renders text with emphasis words highlighted in accent color and 1.2x size.
 * Scans text for matches from captionEmphasisWords array.
 */
export const EmphasisText: React.FC<EmphasisTextProps> = ({
  text,
  emphasisWords,
  accentColor = '#FF6B35',
}) => {
  if (!emphasisWords || emphasisWords.length === 0) {
    return <>{text}</>;
  }

  // Build regex that matches any of the emphasis words
  const escaped = emphasisWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);

  const emphasisSet = new Set(emphasisWords);

  return (
    <>
      {parts.map((part, i) =>
        emphasisSet.has(part) ? (
          <span
            key={i}
            style={{
              color: accentColor,
              fontSize: '1.2em',
              fontWeight: 900,
            }}
          >
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};
