import './ValueChecklistItem.css'

function CheckBox({ checked }) {
  return (
    <div className={`vcli__box${checked ? ' vcli__box--checked' : ''}`}>
      {checked && (
        <svg className="vcli__checkmark" viewBox="0 0 9 7" aria-hidden="true">
          <path d="M1 3.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      )}
    </div>
  )
}

function LoaderIcon() {
  return (
    <svg className="vcli__loader" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M5 1v2M5 7v2M1 5h2M7 5h2M2.4 2.4l1.2 1.2M6.4 6.4l1.2 1.2M7.6 2.4l-1.2 1.2M3.6 6.4l-1.2 1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

// `display` is what's rendered (can be JSX, e.g. dk with a subscript pke);
// `symbol` is always the plain-string identity, used as the list key and
// wherever plain text is unavoidable (e.g. the fallback popup title).
function ValueChecklistItem({ symbol, display, state = 'pending', onClick }) {
  const content = display ?? symbol

  if (state === 'done') {
    return (
      <button className="vcli vcli--done" onClick={onClick}>
        <CheckBox checked />
        <span className="body-text vcli__symbol">{content}</span>
        <span className="vcli__chevron" aria-hidden="true">›</span>
      </button>
    )
  }

  return (
    <div className={`vcli vcli--${state}`}>
      <CheckBox checked={false} />
      <span className="body-text vcli__symbol">{content}</span>
      {state === 'loading' && <LoaderIcon />}
    </div>
  )
}

export default ValueChecklistItem
