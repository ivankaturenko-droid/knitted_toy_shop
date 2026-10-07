import { useState } from 'react';
import Button from '../../../shared/components/Button/Button.jsx';
import Input from '../../../shared/components/Input/Input.jsx';

export default function RegistrationForm({ onSubmit }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: event.currentTarget.name.value,
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
      <Input autoComplete="name" id="name" label="Ім’я" required />
      <Input
        autoComplete="email"
        id="email"
        label="Електронна пошта"
        required
        type="email"
      />
      <Input
        autoComplete="new-password"
        id="password"
        label="Пароль (щонайменше 8 символів)"
        minLength="8"
        required
        type="password"
      />
      {error && <p className="form-message form-message--error">{error}</p>}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Реєстрація...' : 'Зареєструватися'}
      </Button>
    </form>
  );
}
