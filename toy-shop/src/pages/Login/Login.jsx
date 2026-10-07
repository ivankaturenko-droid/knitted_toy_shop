import { Link, Navigate, useNavigate } from 'react-router-dom';
import LoginForm from '../../features/auth/components/LoginForm.jsx';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate replace to="/" />;

  async function handleLogin(credentials) {
    await signIn(credentials);
    navigate('/');
  }

  return (
    <section className="stack">
      <h1 className="page-heading">Вхід</h1>
      <LoginForm onSubmit={handleLogin} />
      <p>
        Ще немає акаунта? <Link to="/registration">Зареєструватися</Link>
      </p>
    </section>
  );
}
