import './Footer.css'

// Thesis credit line pinned to the bottom of the layout shell. The four pieces
// are props so the same footer can be reused/retitled without touching JSX.
function Footer({ label, name, university, year }) {
  const pieces = [label, name, university, year].filter(Boolean)

  return (
    <footer className="footer">
      <p className="micro-label footer__text">
        {pieces.map((piece, i) => (
          <span key={i}>
            {i > 0 && <span className="footer__dot" aria-hidden="true">·</span>}
            {piece}
          </span>
        ))}
      </p>
    </footer>
  )
}

export default Footer
