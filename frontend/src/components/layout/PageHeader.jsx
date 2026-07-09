import './PageHeader.css'

function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      <h1 className="th1">{title}</h1>
      <p className="th2">{subtitle}</p>
    </header>
  )
}

export default PageHeader
