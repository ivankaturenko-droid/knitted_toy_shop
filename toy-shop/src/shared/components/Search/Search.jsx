import styles from './Search.module.css';

export default function Search({
  label = 'Що вас цікавить?',
  className = '',
  onChange,
  placeholder = 'Що вас цікавить?',
  value,
}) {
  return (
    <label className={`${styles.search} ${className}`.trim()}>
      <span className={styles.visuallyHidden}>{label}</span>
      <input
        className={styles.input}
        onChange={onChange}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}
