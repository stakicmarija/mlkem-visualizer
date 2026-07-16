import { useState } from 'react'
import ValueChecklistItem from '../shared/checklist/ValueChecklistItem.jsx'
import Popup from '../shared/popup/Popup.jsx'
import { formatPolynomialPreview } from '../../utils/polynomial.js'
import './GeneratedValuesPanel.css'

const SUB = ['₀', '₁', '₂']

// Flattens a matrix/vector item's coeffsGrid or coeffsList into one
// ordered list of { label, coeffs } cells, so its popup can start at the
// first element (e.g. A₀₀) and page through the rest with prev/next —
// the same navigable popup used for individual matrix-cell clicks.
function cellsFor(item) {
  if (item.coeffsGrid) {
    return item.coeffsGrid.flatMap((row, i) =>
      row.map((coeffs, j) => ({ label: `${item.symbol}${SUB[i]}${SUB[j]}`, coeffs }))
    )
  }
  if (item.coeffsList) {
    return item.coeffsList.map((coeffs, i) => ({ label: `${item.symbol}${SUB[i]}`, coeffs }))
  }
  if (item.coeffs) {
    return [{ label: item.symbol, coeffs: item.coeffs }]
  }
  return null
}

function GeneratedValuesPanel({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null)
  const [cellIndex, setCellIndex] = useState(0)

  const mid = Math.ceil(items.length / 2)
  const leftCol = items.slice(0, mid)
  const rightCol = items.slice(mid)

  function openItem(i) {
    setOpenIndex(i)
    setCellIndex(0)
  }

  const activeItem = openIndex !== null ? items[openIndex] : null
  const cells = activeItem ? cellsFor(activeItem) : null
  const cell = cells ? cells[cellIndex] : null

  return (
    <div className="gen-values-panel">
      <p className="label gen-values-panel__title">Generated Values</p>
      <div className="gen-values-panel__grid">
        <div className="gen-values-panel__col">
          {leftCol.map(({ symbol, display, state }, i) => (
            <ValueChecklistItem
              key={symbol}
              symbol={symbol}
              display={display}
              state={state}
              onClick={state === 'done' ? () => openItem(i) : undefined}
            />
          ))}
        </div>
        <div className="gen-values-panel__col">
          {rightCol.map(({ symbol, display, state }, i) => (
            <ValueChecklistItem
              key={symbol}
              symbol={symbol}
              display={display}
              state={state}
              onClick={state === 'done' ? () => openItem(mid + i) : undefined}
            />
          ))}
        </div>
      </div>

      {activeItem && (
        cell ? (
          <Popup
            title={cell.label}
            body={activeItem.body}
            polynomialPreview={formatPolynomialPreview(cell.label, cell.coeffs)}
            fullCoefficients={cell.coeffs}
            onPrev={() => setCellIndex(i => Math.max(0, i - 1))}
            onNext={() => setCellIndex(i => Math.min(cells.length - 1, i + 1))}
            hasPrev={cellIndex > 0}
            hasNext={cellIndex < cells.length - 1}
            isOpen
            onClose={() => setOpenIndex(null)}
          />
        ) : (
          <Popup
            title={activeItem.title || activeItem.symbol}
            body={activeItem.body}
            value={activeItem.value}
            isOpen
            onClose={() => setOpenIndex(null)}
          />
        )
      )}
    </div>
  )
}

export default GeneratedValuesPanel
