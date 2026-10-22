import { useState } from 'react';
import Button from '../../../shared/components/Button/Button.jsx';
import Input from '../../../shared/components/Input/Input.jsx';

export default function OrderForm({ onSubmit }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        customer: {
          name: event.currentTarget.name.value,
          email: event.currentTarget.email.value,
          address: event.currentTarget.address.value,
        },
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Дані для доставки</h2>
      <Input autoComplete="name" id="name" label="Ім’я" required />
      <Input
        autoComplete="email"
        id="email"
        label="Електронна пошта"
        required
        type="email"
      />
      <Input
        autoComplete="street-address"
        id="address"
        label="Адреса"
        required
      />
      {error && <p className="form-message form-message--error">{error}</p>}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Оформлюємо...' : 'Підтвердити замовлення'}
      </Button>
    </form>
  );
}
