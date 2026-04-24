export default function NumberField({ label, value, onChange, helper, step = '0.5' }) {
  return (
    <label className="number-field">
      <span className="number-label">
        <span>{label}</span>
        {helper && <span className="field-help">{helper}</span>}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        min="0"
        step={step}
        type="number"
      />
    </label>
  )
}
