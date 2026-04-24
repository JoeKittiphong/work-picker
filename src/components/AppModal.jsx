import '../styles/modal.css'

export default function AppModal({ children, dateHint, onClose, title }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        aria-modal="true"
        className="app-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {dateHint && <p>{dateHint}</p>}
          </div>
          <button
            aria-label="ปิด"
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
