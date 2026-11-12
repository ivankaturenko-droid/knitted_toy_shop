import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_PATH } from '../../shared/constants/api.js';
import { isValidUkrainianPhone } from '../../shared/utils/phone.js';
import { useAccountData } from '../../features/account/useAccountData.js';
import { hashPassword } from '../../features/auth/services/authService.js';
import { useFetch } from '../../shared/hooks/useFetch.js';
import styles from './AccountSections.module.css';

const addressFields = [
  ['recipient', 'Ім’я та прізвище отримувача', 'name'],
  ['phone', 'Номер телефону', 'tel'],
  ['city', 'Місто', 'address-level2'],
  ['street', 'Вулиця', 'address-line1'],
  ['building', 'Номер будинку', 'address-line2'],
  ['apartment', 'Номер квартири (необов’язково)', 'address-line2'],
  ['postalCode', 'Поштовий індекс', 'postal-code'],
];

const EMPTY_PASSWORD_VALUES = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};
const EMPTY_PASSWORD_VISIBILITY = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
};

function getProductImage(product) {
  if (!product?.image) return null;
  return product.image.startsWith('/')
    ? product.image
    : `/homepage/images/${encodeURIComponent(product.image)}`;
}

function formatOrderDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Дата невідома'
    : date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

function OrderItems({ items, products = [] }) {
  const productById = new Map(
    products.map((product) => [String(product.id), product])
  );
  return (
    <ul className={styles.orderItems}>
      {(Array.isArray(items) ? items : []).map((item, index) => {
        const product = productById.get(String(item.productId));
        const image = getProductImage(product) || getProductImage(item);
        return (
          <li className={styles.orderItem} key={`${item.productId}-${index}`}>
            {image ? (
              <img alt="" className={styles.orderImage} src={image} />
            ) : (
              <span aria-hidden="true" className={styles.orderImageFallback}>
                🧶
              </span>
            )}
            <span>
              <strong>{item.name || product?.name || item.productId}</strong>
              <small>
                {item.quantity} шт. · {item.price} грн за одиницю
              </small>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function OverviewSection({
  user,
  orders,
  ordersLoading,
  ordersError,
  refetchOrders,
  products,
  productsLoading,
  productsError,
  refetchProducts,
  cartCount,
}) {
  const latestOrder = [...orders].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  )[0];
  const displayName = user.name || user.email || 'друже';

  return (
    <div className={styles.sectionStack}>
      <header className={styles.welcome}>
        <div aria-hidden="true" className={styles.avatar}>
          {displayName.charAt(0).toLocaleUpperCase('uk')}
        </div>
        <div>
          <p>Раді бачити вас у нашій затишній майстерні</p>
          <h2>Вітаємо, {displayName}!</h2>
        </div>
      </header>

      <div aria-label="Статистика кабінету" className={styles.stats}>
        <article className={styles.statCard}>
          <strong>{orders.length}</strong>
          <span>Оформлених замовлень</span>
        </article>
        <article className={styles.statCard}>
          <strong>{cartCount}</strong>
          <span>Товарів у кошику</span>
        </article>
      </div>

      <section aria-labelledby="latest-order-title" className={styles.card}>
        <h2 id="latest-order-title">Останнє замовлення</h2>
        {ordersLoading ? (
          <p role="status">Завантаження замовлень…</p>
        ) : ordersError ? (
          <div role="alert">
            <p>Не вдалося завантажити замовлення: {ordersError.message}</p>
            <button
              onClick={() => refetchOrders().catch(() => {})}
              type="button"
            >
              Спробувати ще раз
            </button>
          </div>
        ) : latestOrder ? (
          <div className={styles.latestOrder}>
            <div className={styles.orderMeta}>
              <div className={styles.orderMetaDetails}>
                <strong>Замовлення №{latestOrder.id}</strong>
                <span>{formatOrderDate(latestOrder.createdAt)}</span>
              </div>
              <span className={styles.status}>
                {latestOrder.status || 'Нове'}
              </span>
            </div>
            <OrderItems items={latestOrder.items} products={products} />
            {productsError && (
              <div role="alert">
                <p>Не вдалося завантажити каталог товарів.</p>
                <button
                  onClick={() => refetchProducts().catch(() => {})}
                  type="button"
                >
                  Спробувати ще раз
                </button>
              </div>
            )}
            {productsLoading && <p role="status">Завантаження товарів…</p>}
            <div className={styles.orderFooter}>
              <strong>Разом: {latestOrder.total} грн</strong>
              <Link className="button" to="/account/orders">
                Переглянути замовлення
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>У вас ще немає замовлень. Знайдіть собі в’язаного друга!</p>
            <Link className="button" to="/catalog">
              Перейти до каталогу
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export function ProfileSection({ user, updateUser }) {
  const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    firstName: nameParts[0] || '',
    lastName: user.lastName || nameParts.slice(1).join(' '),
    phone: user.phone || '',
  });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveInProgress = useRef(false);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function cancelEditing() {
    const currentParts = (user.name || '').trim().split(/\s+/).filter(Boolean);
    setValues({
      firstName: currentParts[0] || '',
      lastName: user.lastName || currentParts.slice(1).join(' '),
      phone: user.phone || '',
    });
    setEditing(false);
    setMessage(null);
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (saveInProgress.current) return;
    setMessage(null);
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const phone = values.phone.trim();
    if (!firstName) {
      setMessage({ type: 'error', text: 'Вкажіть ім’я.' });
      return;
    }
    if (phone && !/^\+?[\d\s()-]{7,20}$/.test(phone)) {
      setMessage({ type: 'error', text: 'Перевірте формат номера телефону.' });
      return;
    }

    saveInProgress.current = true;
    setSaving(true);
    try {
      const response = await fetch(
        `${API_BASE_PATH}/users/${encodeURIComponent(user.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: [firstName, lastName].filter(Boolean).join(' '),
            lastName,
            phone,
          }),
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'Не вдалося зберегти профіль.');
      }
      const safeUser = Object.fromEntries(
        Object.entries(result).filter(
          ([key]) =>
            !['password', 'passwordHash', 'passwordSalt', 'salt'].includes(key)
        )
      );
      updateUser(safeUser);
      setEditing(false);
      setMessage({ type: 'success', text: 'Зміни профілю збережено.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Не вдалося зберегти профіль.',
      });
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  }

  return (
    <section className={`${styles.card} ${styles.brandCard}`}>
      <div className={styles.sectionHeading}>
        <div>
          <h2 className={styles.brandCardTitle}>Особисті дані</h2>
          <p className={styles.sectionDescription}>
            Керуйте інформацією свого профілю
          </p>
        </div>
        {!editing && (
          <button
            className={styles.textButton}
            onClick={() => {
              setMessage(null);
              setEditing(true);
            }}
            type="button"
          >
            Редагувати
          </button>
        )}
      </div>
      <form className={styles.dataForm} onSubmit={saveProfile}>
        <label className="form-field">
          Ім’я
          <input
            autoComplete="given-name"
            disabled={!editing}
            onChange={(event) => updateField('firstName', event.target.value)}
            required
            value={values.firstName}
          />
        </label>
        <label className="form-field">
          Прізвище
          <input
            autoComplete="family-name"
            disabled={!editing}
            onChange={(event) => updateField('lastName', event.target.value)}
            value={values.lastName}
          />
        </label>
        <label className="form-field">
          Email
          <input autoComplete="email" disabled value={user.email || ''} />
          <small>Email не можна змінити в поточній системі авторизації.</small>
        </label>
        <label className="form-field">
          Номер телефону
          <input
            autoComplete="tel"
            disabled={!editing}
            onChange={(event) => updateField('phone', event.target.value)}
            type="tel"
            value={values.phone}
          />
          <small>Формат: 098 123 45 67 або +380 98 123 45 67</small>
        </label>
        {message && (
          <p
            className={`${styles.message} ${styles[message.type]}`}
            role={message.type === 'error' ? 'alert' : 'status'}
          >
            {message.text}
          </p>
        )}
        {editing && (
          <div className={styles.actions}>
            <button className="button" disabled={saving} type="submit">
              {saving ? 'Збереження…' : 'Зберегти зміни'}
            </button>
            <button
              className="button button--secondary"
              disabled={saving}
              onClick={cancelEditing}
              type="button"
            >
              Скасувати
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

export function OrdersSection({
  orders,
  loading,
  error,
  refetch,
  products,
  productsError,
  refetchProducts,
  addToCart,
}) {
  const [addedOrderId, setAddedOrderId] = useState(null);
  const feedbackTimeout = useRef(null);
  const productById = new Map(
    products.map((product) => [String(product.id), product])
  );
  const orderedOrders = [...orders].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );

  useEffect(
    () => () => {
      if (feedbackTimeout.current !== null) {
        window.clearTimeout(feedbackTimeout.current);
      }
    },
    []
  );

  function reorder(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    if (items.length === 0) return;

    items.forEach((item) => {
      const product = productById.get(String(item.productId)) || {
        ...item,
        id: item.productId,
      };
      addToCart(product, item.quantity);
    });

    setAddedOrderId(String(order.id));
    if (feedbackTimeout.current !== null) {
      window.clearTimeout(feedbackTimeout.current);
    }
    feedbackTimeout.current = window.setTimeout(() => {
      setAddedOrderId(null);
      feedbackTimeout.current = null;
    }, 1600);
  }

  return (
    <section
      className={`${styles.card} ${styles.brandCard} ${styles.sectionStack} ${styles.ordersSection}`}
    >
      <div>
        <h2 className={styles.brandCardTitle}>Мої замовлення</h2>
        <p className={styles.sectionDescription}>
          Історія ваших покупок у майстерні
        </p>
      </div>
      {loading ? (
        <p role="status">Завантаження замовлень…</p>
      ) : error ? (
        <div role="alert">
          <p>Не вдалося завантажити замовлення: {error.message}</p>
          <button onClick={() => refetch().catch(() => {})} type="button">
            Спробувати ще раз
          </button>
        </div>
      ) : orderedOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Поки що замовлень немає</p>
          <Link className="button" to="/catalog">
            Перейти до каталогу
          </Link>
        </div>
      ) : (
        <>
          {productsError && (
            <div role="alert">
              <p>Не вдалося завантажити зображення товарів.</p>
              <button
                onClick={() => refetchProducts().catch(() => {})}
                type="button"
              >
                Спробувати ще раз
              </button>
            </div>
          )}
          {orderedOrders.map((order) => (
            <article className={styles.orderCard} key={order.id}>
              <header className={styles.orderHeader}>
                <div>
                  <h3>Замовлення №{order.id}</h3>
                  <p>{formatOrderDate(order.createdAt)}</p>
                </div>
                <span className={styles.status}>
                  {getOrderStatus(order.status)}
                </span>
              </header>
              <OrderItems items={order.items} products={products} />
              <footer className={styles.orderFooter}>
                <strong>Разом: {order.total} грн</strong>
                <button
                  aria-live="polite"
                  className={styles.textButton}
                  onClick={() => reorder(order)}
                  type="button"
                >
                  {addedOrderId === String(order.id)
                    ? 'Додано до кошика'
                    : 'Додати товари до кошика'}
                </button>
              </footer>
              <details className={styles.orderDetails}>
                <summary>Деталі замовлення</summary>
                <p>
                  Адреса доставки:{' '}
                  {order.customer?.address || 'Не зазначено в замовленні'}
                </p>
                <p>
                  Спосіб оплати:{' '}
                  {order.paymentMethod ||
                    order.customer?.paymentMethod ||
                    'Не зазначено в замовленні'}
                </p>
              </details>
            </article>
          ))}
        </>
      )}
    </section>
  );
}

function getOrderStatus(value) {
  const statuses = [
    'Нове',
    'Підтверджено',
    'Обробляється',
    'Відправлено',
    'Виконано',
    'Скасовано',
  ];
  return (
    statuses.find(
      (status) =>
        status.toLocaleLowerCase('uk') ===
        String(value || '').toLocaleLowerCase('uk')
    ) ||
    value ||
    'Нове'
  );
}

const emptyAddress = {
  recipient: '',
  phone: '',
  city: '',
  street: '',
  building: '',
  apartment: '',
  postalCode: '',
  isDefault: false,
};

export function AddressesSection() {
  const {
    addresses,
    addAddress,
    saveAddress,
    removeAddress,
    setDefaultAddress,
    getAddressLabel,
  } = useAccountData();
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(emptyAddress);
  const [message, setMessage] = useState('');

  function startEditing(address) {
    setValues({ ...address });
    setEditingId(address.id);
    setMessage('');
  }

  function cancelEditing() {
    setValues(emptyAddress);
    setEditingId(null);
    setMessage('');
  }

  function save(event) {
    event.preventDefault();
    const phone = String(values.phone || '').trim();
    if (!phone) {
      setMessage('Вкажіть номер телефону.');
      return;
    }
    if (!isValidUkrainianPhone(phone)) {
      setMessage(
        'Введіть український номер у форматі 0981234567 або +380981234567.'
      );
      return;
    }
    const address = {
      ...values,
      recipient: values.recipient.trim(),
      phone,
      city: values.city.trim(),
      street: values.street.trim(),
      building: values.building.trim(),
      apartment: values.apartment.trim(),
      postalCode: values.postalCode.trim(),
    };
    if (editingId === 'new') {
      addAddress(address);
    } else {
      saveAddress(address);
    }
    cancelEditing();
  }

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <section
      className={`${styles.card} ${styles.brandCard} ${styles.sectionStack}`}
    >
      <div className={styles.sectionHeading}>
        <div>
          <h2 className={styles.brandCardTitle}>Адреси доставки</h2>
          <p className={styles.sectionDescription}>
            Збережіть адресу, щоб швидше оформлювати замовлення
          </p>
        </div>
        {!editingId && (
          <button
            className={styles.textButton}
            onClick={() => {
              setValues(emptyAddress);
              setEditingId('new');
            }}
            type="button"
          >
            Додати адресу
          </button>
        )}
      </div>
      {addresses.length === 0 && !editingId && (
        <p className={styles.addressEmpty}>Збережених адрес ще немає</p>
      )}
      <div className={styles.addressList}>
        {addresses.map((address) => (
          <article className={styles.addressCard} key={address.id}>
            <div>
              <h3>{address.recipient}</h3>
              <p>{getAddressLabel(address)}</p>
              <p>{address.phone}</p>
              {address.isDefault && (
                <span className={styles.status}>За замовчуванням</span>
              )}
            </div>
            <div className={styles.addressActions}>
              <button
                className={styles.textButton}
                onClick={() => startEditing(address)}
                type="button"
              >
                Редагувати
              </button>
              {!address.isDefault && (
                <button
                  className={styles.textButton}
                  onClick={() => setDefaultAddress(address.id)}
                  type="button"
                >
                  Зробити основною
                </button>
              )}
              <button
                className={styles.textButton}
                onClick={() => removeAddress(address.id)}
                type="button"
              >
                Видалити
              </button>
            </div>
          </article>
        ))}
      </div>
      {editingId && (
        <form className={styles.addressForm} onSubmit={save}>
          <h3>{editingId === 'new' ? 'Нова адреса' : 'Редагування адреси'}</h3>
          {addressFields.map(([field, label, autoComplete]) => (
            <label className="form-field" key={field}>
              {label}
              <input
                autoComplete={autoComplete}
                onChange={(event) => updateField(field, event.target.value)}
                required={!['apartment'].includes(field)}
                type={field === 'phone' ? 'tel' : 'text'}
                value={values[field]}
              />
            </label>
          ))}
          <label className={styles.checkboxField}>
            <input
              checked={Boolean(values.isDefault)}
              onChange={(event) =>
                updateField('isDefault', event.target.checked)
              }
              type="checkbox"
            />
            Зробити основною адресою
          </label>
          {message && (
            <p className={styles.error} role="alert">
              {message}
            </p>
          )}
          <div className={styles.actions}>
            <button className="button" type="submit">
              Зберегти адресу
            </button>
            <button
              className="button button--secondary"
              onClick={cancelEditing}
              type="button"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function PasswordField({
  name,
  label,
  value,
  visible,
  autoComplete,
  minLength,
  autoFocus = false,
  disabled,
  onChange,
  onToggle,
}) {
  const inputId = `account-${name}`;
  return (
    <div className={styles.passwordField}>
      <label htmlFor={inputId}>{label}</label>
      <div className={styles.passwordInput}>
        <input
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          id={inputId}
          minLength={minLength}
          name={name}
          onChange={onChange}
          required
          type={visible ? 'text' : 'password'}
          value={value}
        />
        <button
          aria-label={`${visible ? 'Приховати' : 'Показати'} ${label.toLocaleLowerCase('uk')}`}
          aria-pressed={visible}
          className={styles.passwordVisibility}
          disabled={disabled}
          onClick={() => onToggle(name)}
          type="button"
        >
          {visible ? 'Сховати' : 'Показати'}
        </button>
      </div>
    </div>
  );
}

export function SettingsSection({ user, onRequestLogout }) {
  const { refetch: requestUser } = useFetch(null, { immediate: false });
  const [passwordValues, setPasswordValues] = useState(EMPTY_PASSWORD_VALUES);
  const [passwordVisibility, setPasswordVisibility] = useState(
    EMPTY_PASSWORD_VISIBILITY
  );
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updatePasswordField(event) {
    const { name, value } = event.target;
    setPasswordValues((current) => ({ ...current, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  }

  function togglePasswordVisibility(field) {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  async function changePassword(event) {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordValues;
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Заповніть усі поля.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Новий пароль має містити щонайменше 8 символів.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('Новий пароль має відрізнятися від поточного.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Нові паролі не збігаються.');
      return;
    }

    setIsSaving(true);
    try {
      const userPath = `/users/${encodeURIComponent(user.id)}`;
      const storedUser = await requestUser(userPath);
      if (!storedUser || String(storedUser.id) !== String(user.id)) {
        throw new Error('Не вдалося знайти запис користувача на сервері.');
      }

      let currentPasswordMatches = false;
      if (storedUser.passwordHash && storedUser.passwordSalt) {
        const { passwordHash } = await hashPassword(
          currentPassword,
          storedUser.passwordSalt
        );
        currentPasswordMatches = passwordHash === storedUser.passwordHash;
      } else if (storedUser.password != null) {
        currentPasswordMatches = storedUser.password === currentPassword;
      } else {
        throw new Error('Не вдалося перевірити поточний пароль акаунта.');
      }

      if (!currentPasswordMatches) {
        setPasswordError('Поточний пароль неправильний.');
        return;
      }

      const credentials = await hashPassword(newPassword);
      const updatedUser = await requestUser(userPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...credentials, password: null }),
      });
      if (
        String(updatedUser.id) !== String(user.id) ||
        updatedUser.passwordHash !== credentials.passwordHash ||
        updatedUser.passwordSalt !== credentials.passwordSalt
      ) {
        throw new Error('Сервер не підтвердив збереження нового пароля.');
      }

      setPasswordValues(EMPTY_PASSWORD_VALUES);
      setPasswordVisibility(EMPTY_PASSWORD_VISIBILITY);
      setPasswordSuccess('Пароль успішно змінено.');
    } catch (error) {
      setPasswordError(
        error instanceof TypeError
          ? 'Не вдалося з’єднатися з JSON Server. Перевірте, чи запущений сервер.'
          : error.message || 'Не вдалося змінити пароль.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      className={`${styles.card} ${styles.brandCard} ${styles.sectionStack}`}
    >
      <div>
        <h2 className={styles.brandCardTitle}>Налаштування</h2>
        <p className={styles.sectionDescription}>
          Інформація облікового запису та безпека
        </p>
      </div>
      <dl className={styles.accountInfo}>
        <div>
          <dt>Email облікового запису</dt>
          <dd>{user.email}</dd>
        </div>
      </dl>
      <div className={styles.passwordSection}>
        <h3>Зміна пароля</h3>
        <form
          className={styles.passwordForm}
          noValidate
          onSubmit={changePassword}
        >
          <PasswordField
            autoComplete="current-password"
            disabled={isSaving}
            label="Поточний пароль"
            name="currentPassword"
            onChange={updatePasswordField}
            onToggle={togglePasswordVisibility}
            value={passwordValues.currentPassword}
            visible={passwordVisibility.currentPassword}
          />
          <PasswordField
            autoComplete="new-password"
            disabled={isSaving}
            label="Новий пароль"
            minLength={8}
            name="newPassword"
            onChange={updatePasswordField}
            onToggle={togglePasswordVisibility}
            value={passwordValues.newPassword}
            visible={passwordVisibility.newPassword}
          />
          <PasswordField
            autoComplete="new-password"
            disabled={isSaving}
            label="Підтвердження нового пароля"
            name="confirmPassword"
            onChange={updatePasswordField}
            onToggle={togglePasswordVisibility}
            value={passwordValues.confirmPassword}
            visible={passwordVisibility.confirmPassword}
          />
          {passwordError && (
            <p className={styles.error} role="alert">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className={styles.passwordSuccess} role="status">
              {passwordSuccess}
            </p>
          )}
          <div className={styles.passwordActions}>
            <button className="button" disabled={isSaving} type="submit">
              {isSaving ? 'Збереження…' : 'Змінити пароль'}
            </button>
          </div>
        </form>
      </div>
      <div className={styles.securityActions}>
        <button
          className="button button--secondary"
          onClick={onRequestLogout}
          type="button"
        >
          Вийти з облікового запису
        </button>
      </div>
    </section>
  );
}
