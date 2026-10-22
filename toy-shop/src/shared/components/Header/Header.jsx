import { Link, useLocation } from 'react-router-dom';
import HomeSectionLink from '../HomeSectionLink.jsx';
import styles from './Header.module.css';

function BasketIcon() {
  return (
    <svg aria-hidden="true" className="icone-bag" viewBox="0 0 48 48">
      <path d="M6 13h36l-3.5 32h-29L6 13Z" fill="#fff" />
      <path
        d="M15 15v-4a9 9 0 0 1 18 0v4"
        fill="none"
        stroke="#698270"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

export default function Header({ cartCount, isHome }) {
  const { pathname } = useLocation();
  const headerClass = isHome ? 'header home-header' : `header ${styles.header}`;
  const containerClass = isHome ? 'container' : styles.container;
  const headerRowClass = isHome ? 'header-container' : styles.headerContainer;
  const navClass = isHome ? 'header-nav' : styles.nav;
  const listClass = isHome ? 'header-list' : styles.list;
  const logoClass = isHome ? 'home-logo' : styles.logo;
  const cartClass = isHome ? 'shopping_cart' : styles.cart;

  function navLinkClass(path) {
    const routeClass = isHome
      ? 'nav-item'
      : `${styles.navLink}${pathname === path ? ` ${styles.active}` : ''}`;
    return `${routeClass} ${styles.navTypography}`;
  }

  return (
    <header className={headerClass}>
      <div className={containerClass}>
        <div className={headerRowClass}>
          <nav aria-label="Головна навігація" className={navClass}>
            <Link aria-label="В’язані іграшки — головна" to="/">
              <img
                alt="В’язані іграшки"
                className={logoClass}
                src="/homepage/images/yarn%201.svg"
              />
            </Link>
            <ul className={listClass}>
              <li>
                <HomeSectionLink
                  className={navLinkClass('/')}
                  sectionId="my_products"
                >
                  Мої іграшки
                </HomeSectionLink>
              </li>
              <li>
                <Link className={navLinkClass('/catalog')} to="/catalog">
                  Каталог
                </Link>
              </li>
              <li>
                <Link className={navLinkClass('/register')} to="/register">
                  Реєстрація
                </Link>
              </li>
              <li>
                <Link className={navLinkClass('/login')} to="/login">
                  Увійти
                </Link>
              </li>
              <li>
                <HomeSectionLink
                  className={navLinkClass('/')}
                  sectionId="about_me"
                >
                  Про мене
                </HomeSectionLink>
              </li>
              <li>
                <HomeSectionLink
                  className={navLinkClass('/')}
                  sectionId="contacts"
                >
                  Контакти
                </HomeSectionLink>
              </li>
            </ul>
          </nav>
          <Link
            aria-label={`Кошик, товарів: ${cartCount}`}
            className={cartClass}
            to="/cart"
          >
            <BasketIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
