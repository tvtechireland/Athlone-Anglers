// Simple original line-art icons for fishing club branding - no traced or
// copied artwork, just basic shapes (body + fin + tail) drawn by hand.

type IconProps = { className?: string };

export function PikeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 12c4-6 14-8 24-8 10 0 20 3 28 4-8 2-10 4-10 4s2 2 10 4c-8 1-18 4-28 4-10 0-20-2-24-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M46 12l10-5v10l-10-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="13" cy="10.5" r="1.2" fill="currentColor" />
      <path d="M8 12c6-1.5 14-2 20-1" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export function ScrollIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 4h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6 4a2 2 0 1 0-2 2h2M18 4a2 2 0 1 1 2 2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function TroutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 56 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 12c0-5 8-8 17-8 10 0 17 4 21 5-4 1-7 2-7 3s3 2 7 3c-4 1-11 5-21 5-9 0-17-3-17-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M44 12l8-4v8l-8-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16" cy="10" r="1.1" fill="currentColor" />
      <circle cx="24" cy="8.5" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="29" cy="11" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="13.5" r="0.8" fill="currentColor" opacity="0.6" />
      <circle cx="32" cy="7" r="0.8" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
