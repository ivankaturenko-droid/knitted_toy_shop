import { Link, NavLink } from 'react-router-dom';
import './Header.css';

export default function Header({ cartCount, user, onLogout }) {
  return (
    <header className="site-header">
      <Link className="site-brand" to="/">
        В’язані іграшки
      </Link>
      <nav className="site-nav" aria-label="Головна навігація">
        <NavLink to="/catalog">Каталог</NavLink>
        <NavLink to="/cart">Кошик ({cartCount})</NavLink>
        {user ? (
          <button className="text-button" onClick={onLogout} type="button">
            Вийти, {user.name}
          </button>
        ) : (
          <>
            <NavLink to="/login">Увійти</NavLink>
            <NavLink to="/registration">Реєстрація</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
