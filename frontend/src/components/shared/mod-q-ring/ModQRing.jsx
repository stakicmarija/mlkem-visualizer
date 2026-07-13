import './ModQRing.css'

// 0° = top, increasing clockwise -- matches how q grows "around" the ring.
function pointOnRing(angleDeg, radius, cx, cy) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

// SVG arc path along the ring from fromAngle to toAngle, sweeping clockwise.
function arcPath(fromAngle, toAngle, radius, cx, cy) {
  const start = pointOnRing(fromAngle, radius, cx, cy)
  const end = pointOnRing(toAngle, radius, cx, cy)
  const delta = ((toAngle - fromAngle) % 360 + 360) % 360
  const largeArc = delta > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

// A circle representing Z_q (the ring of coefficients mod q), with tick
// marks at the four quarter points. `anchors` marks specific labeled
// values (e.g. the two points a message bit can Decompress to) just
// outside the ring -- when an anchor lands on the same angle as a tick,
// the anchor's more specific label (e.g. "1665") replaces the tick's
// generic one ("q/2"). `regions` paints colored arcs along the ring itself
// (e.g. the "decodes to 0" vs "decodes to q/2" halves) -- optional, so the
// same component still works as a plain labeled ring elsewhere.
function ModQRing({ q, size = 220, anchors = [], regions = [] }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 36
  const anchorAngles = new Set(anchors.map(a => a.angle))

  const ticks = [
    { angle: 0, label: '0' },
    { angle: 90, label: 'q/4' },
    { angle: 180, label: 'q/2' },
    { angle: 270, label: '3q/4' },
  ]

  return (
    <svg className="mod-q-ring" viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      <circle cx={cx} cy={cy} r={radius} className="mod-q-ring__circle" />

      {regions.map((region, i) => (
        <path
          key={i}
          d={arcPath(region.fromAngle, region.toAngle, radius, cx, cy)}
          className="mod-q-ring__region"
          style={{ '--region-color': `var(--color-${region.colorToken})` }}
        />
      ))}

      {ticks.map(tick => {
        const inner = pointOnRing(tick.angle, radius - 6, cx, cy)
        const outer = pointOnRing(tick.angle, radius + 6, cx, cy)
        const labelPt = pointOnRing(tick.angle, radius + 22, cx, cy)
        return (
          <g key={tick.angle}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className="mod-q-ring__tick" />
            {!anchorAngles.has(tick.angle) && (
              <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__tick-label">{tick.label}</text>
            )}
          </g>
        )
      })}

      <text x={cx} y={cy} className="mod-q-ring__center-label">
        ℤ<tspan className="mod-q-ring__center-label-sub" dy="4">{q}</tspan>
      </text>

      {anchors.map(anchor => {
        const dot = pointOnRing(anchor.angle, radius, cx, cy)
        const labelPt = pointOnRing(anchor.angle, radius + 22, cx, cy)
        return (
          <g key={anchor.angle} style={{ '--anchor-color': `var(--color-${anchor.colorToken})` }}>
            <circle cx={dot.x} cy={dot.y} r={5} className="mod-q-ring__anchor-dot" />
            <text x={labelPt.x} y={labelPt.y} className="mod-q-ring__anchor-label">{anchor.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default ModQRing
