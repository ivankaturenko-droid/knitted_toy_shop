import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import decor from '../../styles/brand-decorations.module.css';
import Button from '../../shared/components/Button/Button.jsx';
import Input from '../../shared/components/Input/Input.jsx';
import styles from './AuthPage.module.css';

export default function AuthPage({ mode, isModal = false, onClose }) {
  const isRegistration = mode === 'registration';
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isModal) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') onClose?.();
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModal, onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();
    const passwordConfirmation = formData
      .get('password-confirmation')
      ?.toString();

    if (isRegistration && password !== passwordConfirmation) {
      setError('Паролі не збігаються. Перевірте підтвердження пароля.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegistration) {
        await signUp({ name, email, password });
      } else {
        await signIn({ email, password });
      }
      onClose?.();
      navigate('/');
    } catch (submitError) {
      setError(
        submitError.message || 'Не вдалося виконати запит. Спробуйте ще раз.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className={`${styles.page}${isModal ? ` ${styles.modalPage}` : ` ${decor.pageDecor}`}`}
    >
      <span
        aria-hidden="true"
        className={`${styles.berry} ${styles.berryLeft}`}
      />
      <span
        aria-hidden="true"
        className={`${styles.berry} ${styles.berryRight}`}
      />
      <div className={styles.card}>
        {isModal && (
          <button
            aria-label="Закрити вікно авторизації"
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <header className={styles.heading}>
            <h1>{isRegistration ? 'Реєстрація' : 'Вхід'}</h1>
            <p>
              {isRegistration
                ? 'Створіть акаунт у магазині'
                : 'Раді бачити вас знову'}
            </p>
          </header>
          {isRegistration && (
            <Input
              autoComplete="name"
              id="name"
              label="Ім’я"
              name="name"
              placeholder="Введіть ваше ім’я"
              required
            />
          )}
          <Input
            autoComplete="email"
            id="email"
            label="Електронна пошта"
            name="email"
            placeholder="name@example.com"
            type="email"
            required
          />
          <Input
            autoComplete={isRegistration ? 'new-password' : 'current-password'}
            id="password"
            label="Пароль"
            name="password"
            placeholder="Введіть пароль"
            minLength={8}
            required
            type="password"
          />
          {isRegistration && (
            <Input
              autoComplete="new-password"
              id="password-confirmation"
              label="Підтвердження паролю"
              name="password-confirmation"
              placeholder="Повторіть пароль"
              minLength={8}
              required
              type="password"
            />
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button
            className={styles.submit}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? 'Зачекайте…'
              : isRegistration
                ? 'Зареєструватися'
                : 'Увійти'}
          </Button>
          <p className={styles.switchMode}>
            {isRegistration ? 'Вже маєте акаунт?' : 'Ще не маєте акаунта?'}{' '}
            <Link to={isRegistration ? '/login' : '/register'}>
              {isRegistration ? 'Увійти' : 'Зареєструватися'}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
