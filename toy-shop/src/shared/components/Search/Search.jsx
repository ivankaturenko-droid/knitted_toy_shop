export default function Search({ value, onChange }) {
  return (
    <label className="product-search">
      <span className="visually-hidden">Пошук товарів</span>
      <input
        className="search-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Знайти іграшку..."
      />
    </label>
  );
}
