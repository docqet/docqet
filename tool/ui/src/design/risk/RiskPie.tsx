/*
 * Risk carried as a pie filling clockwise from the top, as far as the share
 * of the most it could carry, over a tint of the whole, both in its band's
 * color (--risk-band, from data-risk-band). Decorative: what shows it says
 * what it means.
 */
export function RiskPie({ percent, size }: { percent: number; size: number }) {
  const r = size / 2;
  const share = Math.min(1, Math.max(0, percent / 100));
  const angle = share * 2 * Math.PI;
  const x = r + r * Math.sin(angle);
  const y = r - r * Math.cos(angle);
  return (
    <svg className="risk-pie" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle className="risk-pie-whole" cx={r} cy={r} r={r} />
      {share >= 1 ? (
        <circle className="risk-pie-fill" cx={r} cy={r} r={r} />
      ) : share > 0 ? (
        <path className="risk-pie-fill" d={`M ${r} ${r} L ${r} 0 A ${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${x} ${y} Z`} />
      ) : null}
    </svg>
  );
}
