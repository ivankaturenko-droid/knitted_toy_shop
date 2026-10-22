import Button from '../../shared/components/Button/Button.jsx';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <div className={styles.card}>
        <img
          alt=""
          className={styles.illustration}
          src="/homepage/images/yarn%201.svg"
        />
        <p className={styles.code}>404</p>
        <h1 className={styles.title} id="not-found-title">
          Сторінку не знайдено
        </h1>
        <p className={styles.message}>
          Можливо, адресу введено неправильно або сторінку переміщено.
        </p>
        <div className={styles.actions}>
          <Button to="/">На головну</Button>
          <Button className={styles.catalogButton} to="/catalog">
            До каталогу
          </Button>
        </div>
      </div>
    </section>
  );
}
