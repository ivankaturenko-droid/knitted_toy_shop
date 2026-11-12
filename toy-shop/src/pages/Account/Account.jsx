import { useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { useCart } from '../../features/cart/hooks/useCart.js';
import { useFetch } from '../../shared/hooks/useFetch.js';
import decor from '../../styles/brand-decorations.module.css';
import {
  AddressesSection,
  OrdersSection,
  OverviewSection,
  ProfileSection,
  SettingsSection,
} from './AccountSections.jsx';
import styles from './Account.module.css';

const navigation = [
  { path: '/account', label: 'Головна', icon: 'home', end: true },
  { path: '/account/profile', label: 'Особисті дані', icon: 'user' },
  { path: '/account/orders', label: 'Мої замовлення', icon: 'orders' },
  { path: '/account/addresses', label: 'Адреса доставки', icon: 'pin' },
  { path: '/account/settings', label: 'Налаштування', icon: 'settings' },
];

const sectionTitles = {
  '': 'Головна',
  profile: 'Особисті дані',
  orders: 'Мої замовлення',
  addresses: 'Адреса доставки',
  settings: 'Налаштування',
};

function NavigationIcon({ name }) {
  const paths = {
    home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    user: 'M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
    orders: 'M4 4h16v16H4zm4 4h8m-8 4h8m-8 4h5',
    pin: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    settings:
      'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3m9-9h-3M6 12H3m15.4-6.4-2.1 2.1M7.7 16.3l-2.1 2.1m12.8 0-2.1-2.1m-8.6-8.6L5.6 5.6',
    logout: 'M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7',
  };
  return (
    <svg
      aria-hidden="true"
      className={styles.navIcon}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function Account() {
  const { user, logout, updateUser } = useAuth();
  const { itemCount, addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const logoutTriggerRef = useRef(null);
  const {
    data: orders = [],
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useFetch(user ? `/orders?userId=${encodeURIComponent(user.id)}` : null);
  const {
    data: products = [],
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useFetch(user ? '/products' : null);

  useEffect(() => {
    if (!logoutDialogOpen) return undefined;

    const trigger = logoutTriggerRef.current;
    function handleKeyDown(event) {
      if (event.key === 'Escape') setLogoutDialogOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [logoutDialogOpen]);

  if (!user) {
    return logoutDialogOpen ? null : (
      <Navigate to="/login?returnTo=%2Faccount" replace />
    );
  }

  const activeSection = location.pathname
    .replace(/^\/account\/?/, '')
    .split('/')[0];
  if (activeSection === 'favorites') {
    return <Navigate to="/account" replace />;
  }
  const title = sectionTitles[activeSection] || sectionTitles[''];
  const userOrders = orders.filter(
    (order) => String(order.userId) === String(user.id)
  );

  function requestLogout(event) {
    logoutTriggerRef.current = event.currentTarget;
    setLogoutDialogOpen(true);
  }

  function confirmLogout() {
    logout();
    navigate('/', { replace: true });
  }

  function renderSection() {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection updateUser={updateUser} user={user} />;
      case 'orders':
        return (
          <OrdersSection
            addToCart={addToCart}
            error={ordersError}
            loading={ordersLoading}
            orders={userOrders}
            products={products}
            productsError={productsError}
            refetch={refetchOrders}
            refetchProducts={refetchProducts}
          />
        );
      case 'addresses':
        return <AddressesSection />;
      case 'settings':
        return <SettingsSection onRequestLogout={requestLogout} user={user} />;
      default:
        return (
          <OverviewSection
            cartCount={itemCount}
            orders={userOrders}
            ordersError={ordersError}
            ordersLoading={ordersLoading}
            products={products}
            productsError={productsError}
            productsLoading={productsLoading}
            refetchOrders={refetchOrders}
            refetchProducts={refetchProducts}
            user={user}
          />
        );
    }
  }

  return (
    <div className={`${decor.pageDecor} ${styles.decor}`}>
      <span
        aria-hidden="true"
        className={`${styles.berry} ${styles.berryLeft}`}
      />
      <span
        aria-hidden="true"
        className={`${styles.berry} ${styles.berryRight}`}
      />
      <section className={styles.page}>
        <h1 className="page-heading">Мій кабінет</h1>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarUser}>
              <span aria-hidden="true" className={styles.sidebarAvatar}>
                {(user.name || user.email || '?')
                  .charAt(0)
                  .toLocaleUpperCase('uk')}
              </span>
              <span>
                <strong>{user.name || 'Користувач'}</strong>
                <small>{user.email}</small>
              </span>
            </div>
            <nav aria-label="Розділи особистого кабінету">
              <ul className={styles.navigation}>
                {navigation.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      className={({ isActive }) =>
                        `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`
                      }
                      end={item.end}
                      to={item.path}
                    >
                      <NavigationIcon name={item.icon} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    className={styles.navLink}
                    onClick={requestLogout}
                    type="button"
                  >
                    <NavigationIcon name="logout" />
                    Вийти
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
          <div className={styles.main}>
            {activeSection !== 'profile' &&
              activeSection !== 'orders' &&
              activeSection !== 'addresses' &&
              activeSection !== 'settings' && (
                <header className={styles.sectionHeader}>
                  <h2>{title}</h2>
                </header>
              )}
            {renderSection()}
          </div>
        </div>
      </section>
      {logoutDialogOpen &&
        createPortal(
          <div
            className={styles.logoutModalBackdrop}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setLogoutDialogOpen(false);
              }
            }}
          >
            <section
              aria-describedby="logout-dialog-description"
              aria-labelledby="logout-dialog-title"
              aria-modal="true"
              className={styles.logoutDialog}
              role="dialog"
            >
              <h2 id="logout-dialog-title">Вийти з облікового запису?</h2>
              <p id="logout-dialog-description">
                Ви впевнені, що хочете вийти з облікового запису?
              </p>
              <div className={styles.logoutDialogActions}>
                <button
                  className="button button--secondary"
                  onClick={() => setLogoutDialogOpen(false)}
                  type="button"
                >
                  Скасувати
                </button>
                <button
                  className="button"
                  onClick={confirmLogout}
                  type="button"
                >
                  Вийти
                </button>
              </div>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}
