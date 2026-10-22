import { Link } from 'react-router-dom';
import styles from './Button.module.css';

export default function Button({
  children,
  className = '',
  to,
  type = 'button',
  ...props
}) {
  const buttonClass = `${styles.button} ${className}`.trim();

  if (to) {
    return (
      <Link className={buttonClass} to={to} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClass} type={type} {...props}>
      {children}
    </button>
  );
}
