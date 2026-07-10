import './InputCard.css'

function CheckIcon() {
  return (
    <svg className="input-card__check-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 10.5l4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function InputCard({ symbol, truncatedHex, onClick }) {
  return (
    <button className="input-card" onClick={onClick}>
      <div className="input-card__header">
        <span className="input-card__symbol">{symbol}</span>
        <CheckIcon />
      </div>
      <div className="input-card__hex">
        <span className="body-text">{truncatedHex}</span>
      </div>
    </button>
  )
}

export default InputCard
