import { useRef, useState } from 'react';
import Button from '../../../shared/components/Button/Button.jsx';
import Input from '../../../shared/components/Input/Input.jsx';
import { isValidUkrainianPhone } from '../../../shared/utils/phone.js';
import styles from './OrderForm.module.css';

const DELIVERY_METHODS = {
  novaPoshtaBranch: {
    label: 'Нова пошта — відділення',
    description: 'Отримання у відділенні Нової пошти.',
  },
  novaPoshtaLocker: {
    label: 'Нова пошта — поштомат',
    description: 'Отримання у поштоматі Нової пошти.',
  },
  ukrposhta: {
    label: 'Укрпошта',
    description: 'Доставка на вказану поштову адресу.',
  },
};

const PAYMENT_METHODS = {
  cashOnDelivery: {
    label: 'Оплата при отриманні',
    description: 'Оплатіть замовлення під час отримання посилки.',
  },
  cardDemo: {
    label: 'Оплата на банківську картку',
    description:
      'Демонстраційний варіант: менеджер повідомить подальші кроки. Дані картки вводити не потрібно.',
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTAL_CODE_PATTERN = /^\d{5}$/;

function getNameParts(fullName = '', preferredLastName = '') {
  const normalizedName = String(fullName).trim();
  const normalizedLastName = String(preferredLastName).trim();
  const nameParts = normalizedName.split(/\s+/).filter(Boolean);

  if (
    normalizedLastName &&
    normalizedName
      .toLocaleLowerCase('uk')
      .endsWith(normalizedLastName.toLocaleLowerCase('uk'))
  ) {
    return {
      firstName: normalizedName.slice(0, -normalizedLastName.length).trim(),
      lastName: normalizedLastName,
    };
  }

  return {
    firstName: nameParts[0] || '',
    lastName: normalizedLastName || nameParts.slice(1).join(' '),
  };
}

function addressLabel(address) {
  const building = address.building?.trim();
  const apartment = address.apartment?.trim();
  return [
    address.city?.trim(),
    address.street?.trim(),
    building && `буд. ${building}`,
    apartment && `кв. ${apartment}`,
    address.postalCode?.trim(),
  ]
    .filter(Boolean)
    .join(', ');
}

function FieldInput({ error, ...props }) {
  const errorId = `${props.id}-error`;
  return (
    <div className={styles.inputField}>
      <Input
        {...props}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : undefined}
      />
      {error && (
        <span className={styles.fieldError} id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function ChoiceGroup({ title, name, value, options, onChange }) {
  return (
    <fieldset className={styles.choiceGroup}>
      <legend>{title}</legend>
      <div className={styles.choiceOptions}>
        {Object.entries(options).map(([optionValue, option]) => (
          <label
            className={`${styles.choiceOption}${value === optionValue ? ` ${styles.choiceOptionSelected}` : ''}`}
            key={optionValue}
          >
            <input
              checked={value === optionValue}
              name={name}
              onChange={() => onChange(optionValue)}
              type="radio"
              value={optionValue}
            />
            <span className={styles.choiceContent}>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function OrderForm({
  onSubmit,
  initialValues = {},
  addresses = [],
  canSubmit = true,
  submitBlockedMessage = '',
}) {
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);
  const defaultAddress =
    addresses.find((address) => address.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddress?.id || ''
  );
  const [deliveryMethod, setDeliveryMethod] = useState('novaPoshtaBranch');
  const [paymentMethod, setPaymentMethod] = useState('cashOnDelivery');
  const [comment, setComment] = useState('');
  const userName = getNameParts(initialValues.name, initialValues.lastName);
  const addressName = getNameParts(defaultAddress?.recipient);
  const [values, setValues] = useState({
    firstName:
      addressName.firstName || initialValues.firstName || userName.firstName,
    lastName:
      addressName.lastName || initialValues.lastName || userName.lastName,
    email: initialValues.email || '',
    phone: defaultAddress?.phone || initialValues.phone || '',
    city: defaultAddress?.city || initialValues.city || '',
    branch: '',
    lockerNumber: '',
    street: defaultAddress?.street || initialValues.street || '',
    building: defaultAddress?.building || initialValues.building || '',
    apartment: defaultAddress?.apartment || initialValues.apartment || '',
    postalCode: defaultAddress?.postalCode || initialValues.postalCode || '',
  });

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setError('');
  }

  function changeDeliveryMethod(method) {
    setDeliveryMethod(method);
    setFieldErrors((current) => {
      const next = { ...current };
      [
        'city',
        'branch',
        'lockerNumber',
        'street',
        'building',
        'postalCode',
      ].forEach((field) => delete next[field]);
      return next;
    });
    setError('');
  }

  function selectAddress(addressId) {
    setSelectedAddressId(addressId);
    const address = addresses.find(
      (savedAddress) => String(savedAddress.id) === addressId
    );
    if (!address) {
      setValues((current) => ({
        ...current,
        city: initialValues.city || '',
        street: initialValues.street || '',
        building: initialValues.building || '',
        apartment: initialValues.apartment || '',
        postalCode: initialValues.postalCode || '',
      }));
      return;
    }

    const recipient = getNameParts(address.recipient);
    setValues((current) => ({
      ...current,
      firstName: recipient.firstName || current.firstName,
      lastName: recipient.lastName || current.lastName,
      phone: address.phone || current.phone,
      city: address.city || '',
      street: address.street || '',
      building: address.building || '',
      apartment: address.apartment || '',
      postalCode: address.postalCode || '',
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      ['city', 'street', 'building', 'postalCode'].forEach((field) => {
        delete next[field];
      });
      return next;
    });
    setError('');
  }

  function validateForm() {
    const errors = {};
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();

    if (!firstName) errors.firstName = 'Вкажіть ім’я.';
    if (!lastName) errors.lastName = 'Вкажіть прізвище.';
    if (!email) {
      errors.email = 'Вкажіть електронну пошту.';
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Введіть коректну електронну адресу.';
    }
    if (!phone) {
      errors.phone = 'Вкажіть номер телефону.';
    } else if (!isValidUkrainianPhone(phone)) {
      errors.phone =
        'Введіть український номер у форматі 0981234567 або +380981234567.';
    }

    if (!values.city.trim()) errors.city = 'Вкажіть місто.';
    if (deliveryMethod === 'novaPoshtaBranch' && !values.branch.trim()) {
      errors.branch = 'Вкажіть номер або назву відділення.';
    }
    if (deliveryMethod === 'novaPoshtaLocker' && !values.lockerNumber.trim()) {
      errors.lockerNumber = 'Вкажіть номер поштомата.';
    }
    if (deliveryMethod === 'ukrposhta') {
      if (!values.street.trim()) errors.street = 'Вкажіть вулицю.';
      if (!values.building.trim()) errors.building = 'Вкажіть номер будинку.';
      if (!values.postalCode.trim()) {
        errors.postalCode = 'Вкажіть поштовий індекс.';
      } else if (!POSTAL_CODE_PATTERN.test(values.postalCode.trim())) {
        errors.postalCode = 'Індекс має містити 5 цифр.';
      }
    }

    return errors;
  }

  function createDelivery() {
    const city = values.city.trim();
    if (deliveryMethod === 'novaPoshtaBranch') {
      const branch = values.branch.trim();
      return {
        address: `${city}, Нова пошта — відділення ${branch}`,
        details: { city, branch },
      };
    }
    if (deliveryMethod === 'novaPoshtaLocker') {
      const lockerNumber = values.lockerNumber.trim();
      return {
        address: `${city}, Нова пошта — поштомат №${lockerNumber}`,
        details: { city, lockerNumber },
      };
    }

    const address = {
      city,
      street: values.street.trim(),
      building: values.building.trim(),
      apartment: values.apartment.trim(),
      postalCode: values.postalCode.trim(),
    };
    return {
      address: addressLabel(address),
      details: address,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current || !canSubmit) return;

    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError('');
    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const delivery = createDelivery();
      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();
      await onSubmit({
        customer: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: delivery.address,
        },
        delivery: {
          method: deliveryMethod,
          label: DELIVERY_METHODS[deliveryMethod].label,
          address: delivery.address,
          details: delivery.details,
        },
        paymentMethod: PAYMENT_METHODS[paymentMethod].label,
        comment: comment.trim(),
      });
    } catch (submitError) {
      setError(
        submitError.message ||
          'Не вдалося оформити замовлення. Спробуйте ще раз.'
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-card" noValidate onSubmit={handleSubmit}>
      <h2>Дані для доставки</h2>
      <section aria-labelledby="buyer-title" className={styles.formSection}>
        <h3 id="buyer-title">Контактні дані</h3>
        <div className={styles.contactFields}>
          <FieldInput
            autoComplete="given-name"
            error={fieldErrors.firstName}
            id="firstName"
            label="Ім’я"
            name="firstName"
            onChange={(event) => updateField('firstName', event.target.value)}
            required
            value={values.firstName}
          />
          <FieldInput
            autoComplete="family-name"
            error={fieldErrors.lastName}
            id="lastName"
            label="Прізвище"
            name="lastName"
            onChange={(event) => updateField('lastName', event.target.value)}
            required
            value={values.lastName}
          />
        </div>
        <FieldInput
          autoComplete="tel"
          error={fieldErrors.phone}
          id="phone"
          inputMode="tel"
          label="Номер телефону"
          name="phone"
          onChange={(event) => updateField('phone', event.target.value)}
          placeholder="+380 50 123 45 67"
          required
          type="tel"
          value={values.phone}
        />
        <FieldInput
          autoComplete="email"
          error={fieldErrors.email}
          id="email"
          label="Електронна пошта"
          name="email"
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="name@example.com"
          required
          type="email"
          value={values.email}
        />
      </section>

      <ChoiceGroup
        name="deliveryMethod"
        onChange={changeDeliveryMethod}
        options={DELIVERY_METHODS}
        title="Спосіб доставки"
        value={deliveryMethod}
      />

      <section
        aria-labelledby="delivery-address-title"
        className={styles.formSection}
      >
        <h3 id="delivery-address-title">Адреса доставки</h3>
        {deliveryMethod === 'ukrposhta' && addresses.length > 0 && (
          <label className={`form-field ${styles.savedAddress}`}>
            Збережена адреса
            <select
              onChange={(event) => selectAddress(event.target.value)}
              value={selectedAddressId}
            >
              <option value="">Ввести іншу адресу</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.recipient} — {addressLabel(address)}
                  {address.isDefault ? ' (основна)' : ''}
                </option>
              ))}
            </select>
          </label>
        )}
        <FieldInput
          autoComplete="address-level2"
          error={fieldErrors.city}
          id="city"
          label="Місто"
          name="city"
          onChange={(event) => updateField('city', event.target.value)}
          required
          value={values.city}
        />
        {deliveryMethod === 'novaPoshtaBranch' && (
          <FieldInput
            error={fieldErrors.branch}
            id="branch"
            label="Номер або назва відділення"
            name="branch"
            onChange={(event) => updateField('branch', event.target.value)}
            required
            value={values.branch}
          />
        )}
        {deliveryMethod === 'novaPoshtaLocker' && (
          <FieldInput
            error={fieldErrors.lockerNumber}
            id="lockerNumber"
            inputMode="numeric"
            label="Номер поштомата"
            name="lockerNumber"
            onChange={(event) =>
              updateField('lockerNumber', event.target.value)
            }
            required
            value={values.lockerNumber}
          />
        )}
        {deliveryMethod === 'ukrposhta' && (
          <>
            <FieldInput
              autoComplete="address-line1"
              error={fieldErrors.street}
              id="street"
              label="Вулиця"
              name="street"
              onChange={(event) => updateField('street', event.target.value)}
              required
              value={values.street}
            />
            <div className={styles.contactFields}>
              <FieldInput
                autoComplete="address-line2"
                error={fieldErrors.building}
                id="building"
                label="Номер будинку"
                name="building"
                onChange={(event) =>
                  updateField('building', event.target.value)
                }
                required
                value={values.building}
              />
              <FieldInput
                autoComplete="address-line2"
                id="apartment"
                label="Квартира / офіс (необов’язково)"
                name="apartment"
                onChange={(event) =>
                  updateField('apartment', event.target.value)
                }
                value={values.apartment}
              />
            </div>
            <FieldInput
              autoComplete="postal-code"
              error={fieldErrors.postalCode}
              id="postalCode"
              inputMode="numeric"
              label="Поштовий індекс"
              maxLength={5}
              name="postalCode"
              onChange={(event) =>
                updateField('postalCode', event.target.value)
              }
              pattern="[0-9]{5}"
              placeholder="5 цифр"
              required
              value={values.postalCode}
            />
          </>
        )}
      </section>

      <ChoiceGroup
        name="paymentMethod"
        onChange={setPaymentMethod}
        options={PAYMENT_METHODS}
        title="Спосіб оплати"
        value={paymentMethod}
      />

      <label className={`${styles.commentField} form-field`}>
        Коментар до замовлення (необов’язково)
        <textarea
          maxLength={500}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Додаткові побажання до замовлення"
          rows={3}
          value={comment}
        />
      </label>

      {submitBlockedMessage && (
        <p className="form-message form-message--error" role="alert">
          {submitBlockedMessage}
        </p>
      )}
      {error && (
        <p className="form-message form-message--error" role="alert">
          {error}
        </p>
      )}
      <Button disabled={isSubmitting || !canSubmit} type="submit">
        {isSubmitting ? 'Оформлюємо…' : 'Підтвердити замовлення'}
      </Button>
    </form>
  );
}
