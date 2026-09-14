/**
 * Simplified State Emblem of India (Lion Capital of Ashoka) drawn as vector.
 * Used in the masthead of both portals, as on any .gov.in property.
 */
export function Emblem({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 60 81"
      className={className}
      role="img"
      aria-label="State Emblem of India"
      fill="currentColor"
    >
      {/* Three visible lion heads */}
      <path d="M30 6c-3.4 0-6 2.3-6.6 5.3-1.6.5-2.8 1.7-3.2 3.2-2.6.5-4.6 2.5-4.6 5 0 .9.2 1.7.7 2.4-1.5 1-2.4 2.6-2.4 4.4h32.2c0-1.8-.9-3.4-2.4-4.4.5-.7.7-1.5.7-2.4 0-2.5-2-4.5-4.6-5-.4-1.5-1.6-2.7-3.2-3.2C36 8.3 33.4 6 30 6z" />
      <circle cx="24.4" cy="17.6" r="1.25" fill="#fff" />
      <circle cx="35.6" cy="17.6" r="1.25" fill="#fff" />
      <path d="M28.2 20.4h3.6l-1.8 2.6z" fill="#fff" />
      {/* Abacus band */}
      <rect x="13" y="27.4" width="34" height="3.2" />
      <rect x="11.5" y="31.2" width="37" height="6.4" rx="0.6" />
      {/* Dharma chakra on the abacus */}
      <circle cx="30" cy="34.4" r="2.5" fill="#fff" />
      <circle cx="30" cy="34.4" r="0.8" />
      {/* Flanking horse / bull silhouettes reduced to blocks */}
      <rect x="16" y="32.6" width="7" height="3.6" rx="1.2" fill="#fff" opacity="0.55" />
      <rect x="37" y="32.6" width="7" height="3.6" rx="1.2" fill="#fff" opacity="0.55" />
      {/* Inverted lotus base */}
      <path d="M14.5 38.2h31l-3.4 7.4H17.9z" />
      <path d="M17.9 45.6h24.2l-2.2 4H20.1z" />
      {/* Motto scroll */}
      <rect x="6" y="51" width="48" height="1.6" />
      <text
        x="30"
        y="60.5"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="0.3"
        style={{ fontFamily: 'serif' }}
      >
        सत्यमेव
      </text>
      <text
        x="30"
        y="71"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="0.3"
        style={{ fontFamily: 'serif' }}
      >
        जयते
      </text>
    </svg>
  );
}

/** Kaushal Setu departmental mark — a bridge over a skills gap. */
export function SetuMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} role="img" aria-label="Kaushal Setu">
      <circle cx="24" cy="24" r="23" fill="#0b2d5c" />
      <circle cx="24" cy="24" r="20.5" fill="none" stroke="#ff9933" strokeWidth="1.2" />
      {/* bridge deck */}
      <rect x="8" y="27" width="32" height="2.6" fill="#ffffff" />
      {/* suspension arc */}
      <path d="M8 27C8 16 40 16 40 27" fill="none" stroke="#ff9933" strokeWidth="2.2" strokeLinecap="round" />
      {/* cables */}
      <g stroke="#ffffff" strokeWidth="1" opacity="0.85">
        <line x1="15" y1="21.2" x2="15" y2="27" />
        <line x1="24" y1="19.4" x2="24" y2="27" />
        <line x1="33" y1="21.2" x2="33" y2="27" />
      </g>
      {/* piers standing on the two banks */}
      <rect x="9" y="29.6" width="4" height="8" fill="#138808" />
      <rect x="35" y="29.6" width="4" height="8" fill="#138808" />
    </svg>
  );
}
