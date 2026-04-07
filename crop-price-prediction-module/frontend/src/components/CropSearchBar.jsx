export default function CropSearchBar({ value, onChange, disabled }) {
  return (
    <label className="field search-field">
      <span>Search crops</span>
      <div className="search-input-wrap">
        <span className="search-icon" aria-hidden>
          ⌕
        </span>
        <input
          type="search"
          className="search-input"
          placeholder="Type a name — e.g. wheat, rice, onion…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </label>
  );
}
