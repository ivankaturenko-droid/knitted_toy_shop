import { useState } from 'react';
import Button from '../../../shared/components/Button/Button.jsx';
import Input from '../../../shared/components/Input/Input.jsx';

export default function LoginForm({ onSubmit }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        email: event.currentTarget.email.value,
        password: event.currentTarget.password.value,
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <Input
        autoComplete="email"
        id="email"
        label="Електронна пошта"
        required
        type="email"
      />
      <Input
        autoComplete="current-password"
        id="password"
        label="Пароль"
        minLength="8"
        required
        type="password"
      />
      {error && <p className="form-message form-message--error">{error}</p>}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Вхід...' : 'Увійти'}
      </Button>
    </form>
  );
}
