'use client'

/**
 * EmojiIcon
 * Rounded square container for an emoji task icon.
 * Props: emoji (string), bg (string), size (number)
 */
export default function EmojiIcon({ emoji, bg = '#fff', size = 48 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        flexShrink: 0,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
      }}
    >
      {emoji || '🧶'}
    </div>
  )
}
