'use client';

/**
 * The signature visual: a literal bucket, filled to a level proportional to
 * tokens/capacity. Used in the hero (large) and the deep-dive simulator
 * (smaller), so the same device carries meaning across the page.
 */
export default function BucketGauge({ tokens, capacity, size = 220, flash }) {
  const pct = Math.max(0, Math.min(1, tokens / capacity));
  const innerHeight = size * 0.62;
  const innerWidth = size * 0.72;
  const fillHeight = innerHeight * pct;

  const topY = size * 0.22;
  const bottomY = topY + innerHeight;
  const left = (size - innerWidth) / 2;
  const right = left + innerWidth;
  const taper = innerWidth * 0.08;

  const fillColor = flash === 'rejected' ? '#FF5D5D' : '#FFB020';

  return (
    <div className="relative" style={{ width: size, height: size * 1.05 }}>
      <svg width={size} height={size * 1.05} viewBox={`0 0 ${size} ${size * 1.05}`}>
        <defs>
          <clipPath id={`bucketClip-${size}`}>
            <path
              d={`M ${left} ${topY} L ${right} ${topY} L ${right - taper} ${bottomY} L ${left + taper} ${bottomY} Z`}
            />
          </clipPath>
          <linearGradient id={`liquid-${size}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* liquid fill, clipped to bucket silhouette */}
        <g clipPath={`url(#bucketClip-${size})`}>
          <rect
            x={left}
            y={bottomY - fillHeight}
            width={innerWidth}
            height={fillHeight}
            fill={`url(#liquid-${size})`}
            style={{ transition: 'y 0.15s linear, height 0.15s linear' }}
          />
          <rect
            x={left}
            y={bottomY - fillHeight}
            width={innerWidth}
            height={2}
            fill={fillColor}
            style={{ transition: 'y 0.15s linear' }}
          />
        </g>

        {/* bucket outline (trapezoid) */}
        <path
          d={`M ${left} ${topY} L ${right} ${topY} L ${right - taper} ${bottomY} L ${left + taper} ${bottomY} Z`}
          fill="none"
          stroke="#2E3648"
          strokeWidth="2"
        />
        {/* rim */}
        <ellipse cx={size / 2} cy={topY} rx={innerWidth / 2} ry={innerWidth * 0.07} fill="none" stroke="#2E3648" strokeWidth="2" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="font-mono text-3xl font-medium tabular-nums" style={{ color: fillColor }}>
          {Math.floor(tokens)}
        </span>
        <span className="eyebrow mt-0.5">/ {capacity} tokens</span>
      </div>
    </div>
  );
}
