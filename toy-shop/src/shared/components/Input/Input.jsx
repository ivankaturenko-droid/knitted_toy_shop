import styles from './Input.module.css';

export default function Input({ label, id, ...props }) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
    </label>
  );
}
