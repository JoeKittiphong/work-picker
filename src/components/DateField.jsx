export default function DateField({ label, value, onChange, helper }) {
  return (
    <label className="number-field">
      <span className="number-label">
        <span>{label}</span>
        {helper && <span className="field-help">{helper}</span>}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="date"
      />
    </label>
  )
}
