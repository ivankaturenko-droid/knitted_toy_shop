import { Link, Navigate, useNavigate } from 'react-router-dom';
import RegistrationForm from '../../features/auth/components/RegistrationForm.jsx';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export default function Registration() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate replace to="/" />;

  async function handleRegistration(details) {
    await signUp(details);
    navigate('/');
  }

  return (
    <section className="stack">
      <h1 className="page-heading">Реєстрація</h1>
      <RegistrationForm onSubmit={handleRegistration} />
      <p>
        Уже маєте акаунт? <Link to="/login">Увійти</Link>
      </p>
    </section>
  );
}
