import './DataChip.css'

// Small bordered/filled chip for one raw data unit -- a bit, a hex byte
// pair, a coefficient preview. `tone` picks a neutral 0/1-style color
// ('outline' = light/bordered, 'filled' = solid --color-inactive); pass
// `colorToken` instead for a specific semantic color (e.g. the CBD popup's
// x/y bit highlighting). Used anywhere raw bytes/bits need a visual box --
// the CBD popup's PRF output bits, and Encapsulation's ByteDecode step.
function DataChip({ value, size = 'sm', tone = 'outline', colorToken }) {
  const style = colorToken ? { '--chip-color': `var(--color-${colorToken})` } : undefined
  return (
    <span
      className={`data-chip data-chip--${size} data-chip--${colorToken ? 'accent' : tone}`}
      style={style}
    >
      {value}
    </span>
  )
}

export default DataChip
