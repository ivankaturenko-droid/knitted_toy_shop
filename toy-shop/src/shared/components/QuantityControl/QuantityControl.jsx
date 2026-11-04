import styles from './QuantityControl.module.css';

export default function QuantityControl({
  value,
  onChange,
  min = 1,
  className = '',
  label = 'Кількість',
  decreaseLabel = 'Зменшити кількість',
  increaseLabel = 'Збільшити кількість',
}) {
  return (
    <div className={`${styles.group} ${className}`.trim()}>
      <span className={styles.label}>{label}</span>
      <div className={styles.control}>
        <button
          aria-label={decreaseLabel}
          className={styles.button}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          type="button"
        >
          −
        </button>
        <span aria-live="polite" className={styles.value}>
          {value}
        </span>
        <button
          aria-label={increaseLabel}
          className={styles.button}
          onClick={() => onChange(value + 1)}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
