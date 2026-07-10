import { useState } from 'react'
import ValueChecklistItem from '../shared/ValueChecklistItem.jsx'
import Popup from '../shared/Popup.jsx'
import './GeneratedValuesPanel.css'

function GeneratedValuesPanel({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null)

  const mid = Math.ceil(items.length / 2)
  const leftCol = items.slice(0, mid)
  const rightCol = items.slice(mid)

  return (
    <div className="gen-values-panel">
      <p className="label gen-values-panel__title">Generated Values</p>
      <div className="gen-values-panel__grid">
        <div className="gen-values-panel__col">
          {leftCol.map(({ symbol, state }, i) => (
            <ValueChecklistItem
              key={symbol}
              symbol={symbol}
              state={state}
              onClick={state === 'done' ? () => setOpenIndex(i) : undefined}
            />
          ))}
        </div>
        <div className="gen-values-panel__col">
          {rightCol.map(({ symbol, state }, i) => (
            <ValueChecklistItem
              key={symbol}
              symbol={symbol}
              state={state}
              onClick={state === 'done' ? () => setOpenIndex(mid + i) : undefined}
            />
          ))}
        </div>
      </div>

      {openIndex !== null && items[openIndex] && (
        <Popup
          title={items[openIndex].title || items[openIndex].symbol}
          body={items[openIndex].body}
          value={items[openIndex].value}
          isOpen
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  )
}

export default GeneratedValuesPanel
