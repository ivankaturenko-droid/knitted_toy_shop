describe('Особистий кабінет', () => {
  const initialPassword = 'CurrentPassword123';
  let user;
  let reorderOrderId;

  before(() => {
    user = {
      name: 'Тестовий Користувач',
      email: `account-test-${Date.now()}@example.com`,
      phone: '',
    };
    cy.request('POST', 'http://127.0.0.1:3000/users', user).then(({ body }) => {
      user = { ...user, ...body };
      return cy.request(
        'PATCH',
        `http://127.0.0.1:3000/users/${encodeURIComponent(user.id)}`,
        { password: initialPassword }
      );
    });
  });

  after(() => {
    if (reorderOrderId != null) {
      cy.request({
        method: 'DELETE',
        url: `http://127.0.0.1:3000/orders/${encodeURIComponent(reorderOrderId)}`,
        failOnStatusCode: false,
      });
    }
    if (user?.id != null) {
      cy.request({
        method: 'DELETE',
        url: `http://127.0.0.1:3000/users/${encodeURIComponent(user.id)}`,
        failOnStatusCode: false,
      });
    }
  });

  beforeEach(() => {
    cy.request(
      'PATCH',
      `http://127.0.0.1:3000/users/${encodeURIComponent(user.id)}`,
      {
        password: initialPassword,
        passwordHash: null,
        passwordSalt: null,
      }
    );
    cy.visit('/account', {
      onBeforeLoad(window) {
        window.localStorage.setItem('knitted-toy-token', 'account-test-token');
        window.localStorage.setItem('knitted-toy-user', JSON.stringify(user));
        window.localStorage.setItem('knitted-toy-account-data', '{}');
        window.localStorage.setItem(
          'knitted-toy-carts-by-user',
          JSON.stringify({
            [user.id]: [
              {
                id: 'spider',
                name: 'Тестова іграшка',
                price: 250,
                quantity: 1,
              },
            ],
          })
        );
      },
    });
  });

  it('дозволяє оновити профіль, зберегти адресу та використати її при checkout', () => {
    cy.get('nav[aria-label="Розділи особистого кабінету"]')
      .contains('Особисті дані')
      .click();
    cy.contains('button', 'Редагувати').click();
    cy.get('input[autocomplete="given-name"]').clear().type('Марта');
    cy.get('input[autocomplete="family-name"]').clear().type('Клименко');
    cy.get('input[autocomplete="tel"]').clear().type('+380 50 123 4567');
    cy.contains('button', 'Зберегти зміни').click();
    cy.contains('Зміни профілю збережено').should('be.visible');

    cy.get('nav[aria-label="Розділи особистого кабінету"]')
      .contains('Адреса доставки')
      .click();
    cy.contains('button', 'Додати адресу').click();
    cy.get('input[autocomplete="name"]').type('Марта Клименко');
    cy.get('input[autocomplete="tel"]').type('1234567');
    cy.get('input[autocomplete="address-level2"]').type('Львів');
    cy.get('input[autocomplete="address-line1"]').type('Зелена');
    cy.get('input[autocomplete="address-line2"]').first().type('12');
    cy.get('input[autocomplete="postal-code"]').type('79000');
    cy.contains('button', 'Зберегти адресу').click();
    cy.contains(
      '[role="alert"]',
      'Введіть український номер у форматі 0981234567'
    ).should('be.visible');
    cy.get('input[autocomplete="tel"]').clear().type('380+50 123 4567');
    cy.contains(
      '[role="alert"]',
      'Введіть український номер у форматі 0981234567'
    ).should('be.visible');
    cy.get('input[autocomplete="tel"]').clear().type('+380 50 123 4567');
    cy.contains('button', 'Зберегти адресу').click();
    cy.contains('Львів, Зелена, буд. 12, 79000').should('be.visible');

    cy.visit('/checkout');
    cy.get('input[name="deliveryMethod"][value="ukrposhta"]').check();
    cy.get('select').should('not.have.value', '');
    cy.get('input[name="phone"]').should('have.value', '+380 50 123 4567');
    cy.get('input[name="city"]').should('have.value', 'Львів');
    cy.get('input[name="street"]').should('have.value', 'Зелена');
    cy.get('input[name="building"]').should('have.value', '12');
    cy.get('input[name="apartment"]').should('have.value', '');
    cy.get('input[name="postalCode"]').should('have.value', '79000');

    cy.intercept('POST', '**/api/orders', {
      statusCode: 201,
      body: { id: 'checkout-test-order' },
    }).as('createOrder');
    cy.contains('button', 'Підтвердити замовлення').click();
    cy.wait('@createOrder')
      .its('request.body.customer.address')
      .should('eq', 'Львів, Зелена, буд. 12, 79000');
    cy.contains('Номер замовлення: checkout-test-order').should('be.visible');
  });

  it('видаляє функціонал обраного', () => {
    cy.window().then((window) => {
      window.localStorage.setItem(
        'knitted-toy-account-data',
        JSON.stringify({
          [user.id]: {
            favorites: [{ id: 'spider', name: 'Тестова іграшка' }],
            addresses: [],
          },
        })
      );
    });

    cy.reload();
    cy.get('nav[aria-label="Розділи особистого кабінету"]').should(
      'not.contain.text',
      'Обране'
    );
    cy.contains('Товарів в обраному').should('not.exist');
    cy.window()
      .then((window) =>
        JSON.parse(
          window.localStorage.getItem('knitted-toy-account-data') || '{}'
        )
      )
      .should('deep.equal', {
        [user.id]: { addresses: [] },
      });

    cy.visit('/account/favorites');
    cy.location('pathname').should('eq', '/account');
    cy.visit('/catalog');
    cy.get('button[aria-label*="обраного"]').should('not.exist');
    cy.get('article').first().find('a').first().click();
    cy.contains('button', '♡ Додати до обраного').should('not.exist');
  });

  it('показує підтвердження після повторного додавання товарів у кошик', () => {
    cy.request('POST', 'http://127.0.0.1:3000/orders', {
      userId: user.id,
      customer: {
        name: user.name,
        email: user.email,
        address: 'Львів',
      },
      items: [
        {
          productId: 'spider',
          name: 'Тестова іграшка',
          price: 250,
          quantity: 2,
        },
      ],
      total: 500,
      createdAt: new Date().toISOString(),
      status: 'Нове',
    }).then(({ body }) => {
      reorderOrderId = body.id;
    });

    cy.visit('/account/orders');
    cy.contains('button', 'Додати товари до кошика').click();
    cy.contains('button', 'Додано до кошика').should('be.visible');
    cy.window()
      .then((window) => {
        const carts = JSON.parse(
          window.localStorage.getItem('knitted-toy-carts-by-user') || '{}'
        );
        return carts[user.id].find((item) => item.id === 'spider').quantity;
      })
      .should('eq', 3);
    cy.wait(1700);
    cy.contains('button', 'Додати товари до кошика').should('be.visible');
  });

  it('змінює пароль і перевіряє всі поля', () => {
    cy.get('nav[aria-label="Розділи особистого кабінету"]')
      .contains('Налаштування')
      .click();
    cy.contains('Ідентифікатор користувача').should('not.exist');
    cy.get('input[name="currentPassword"]').should('be.visible');
    cy.contains('mock-сховище, не production-захист').should('not.exist');
    cy.get('[role="dialog"]').should('not.exist');

    cy.contains('button', 'Змінити пароль').click();
    cy.contains('[role="alert"]', 'Заповніть усі поля.').should('be.visible');

    cy.get('input[name="currentPassword"]').type(initialPassword);
    cy.get('input[name="newPassword"]').type('short');
    cy.get('input[name="confirmPassword"]').type('short');
    cy.contains('button', 'Змінити пароль').click();
    cy.contains('[role="alert"]', 'щонайменше 8 символів').should('be.visible');

    cy.get('input[name="newPassword"]').clear().type(initialPassword);
    cy.get('input[name="confirmPassword"]').clear().type(initialPassword);
    cy.contains('button', 'Змінити пароль').click();
    cy.contains('[role="alert"]', 'відрізнятися від поточного').should(
      'be.visible'
    );

    cy.get('input[name="newPassword"]').clear().type('NewPassword123');
    cy.get('input[name="confirmPassword"]')
      .clear()
      .type('DifferentPassword123');
    cy.contains('button', 'Змінити пароль').click();
    cy.contains('[role="alert"]', 'не збігаються').should('be.visible');

    cy.get('input[name="currentPassword"]').clear().type('WrongPassword123');
    cy.get('input[name="confirmPassword"]').clear().type('NewPassword123');
    cy.contains('button', 'Змінити пароль').click();
    cy.contains('[role="alert"]', 'Поточний пароль неправильний.').should(
      'be.visible'
    );

    cy.get('button[aria-label="Показати поточний пароль"]').click();
    cy.get('input[name="currentPassword"]').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Приховати поточний пароль"]').click();
    cy.get('input[name="currentPassword"]').should(
      'have.attr',
      'type',
      'password'
    );
    cy.get('button[aria-label="Показати новий пароль"]').click();
    cy.get('input[name="newPassword"]').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Показати підтвердження нового пароля"]').click();
    cy.get('input[name="confirmPassword"]').should('have.attr', 'type', 'text');

    cy.get('input[name="currentPassword"]').clear().type(initialPassword);
    cy.contains('button', 'Змінити пароль').click();
    cy.contains('[role="status"]', 'Пароль успішно змінено.').should(
      'be.visible'
    );
    cy.get('input[name="currentPassword"]').type('NewPassword123');
    cy.get('input[name="newPassword"]').type('FinalPassword456');
    cy.get('input[name="confirmPassword"]').type('FinalPassword456');
    cy.contains('button', 'Змінити пароль').click();
    cy.contains('[role="status"]', 'Пароль успішно змінено.').should(
      'be.visible'
    );

    const userUrl = `http://127.0.0.1:3000/users/${encodeURIComponent(user.id)}`;
    cy.request('GET', userUrl).its('body.password').should('be.null');
    cy.request('GET', userUrl)
      .its('body.passwordHash')
      .should('be.a', 'string')
      .and('not.be.empty');
    cy.request('GET', userUrl)
      .its('body.passwordSalt')
      .should('be.a', 'string')
      .and('not.be.empty');
  });

  it('повідомляє про недоступність JSON Server під час зміни пароля', () => {
    cy.get('nav[aria-label="Розділи особистого кабінету"]')
      .contains('Налаштування')
      .click();
    cy.intercept('GET', `**/api/users/${user.id}`, {
      forceNetworkError: true,
    }).as('readUser');
    cy.get('input[name="currentPassword"]').type(initialPassword);
    cy.get('input[name="newPassword"]').type('NewPassword123');
    cy.get('input[name="confirmPassword"]').type('NewPassword123');
    cy.contains('button', 'Змінити пароль').click();
    cy.wait('@readUser');
    cy.contains(
      '[role="alert"]',
      'Не вдалося з’єднатися з JSON Server.'
    ).should('be.visible');
  });

  it('показує помилку, якщо JSON Server недоступний під час збереження', () => {
    cy.get('nav[aria-label="Розділи особистого кабінету"]')
      .contains('Налаштування')
      .click();
    cy.intercept('PATCH', `**/api/users/${user.id}`, {
      forceNetworkError: true,
    }).as('updateUser');
    cy.get('input[name="currentPassword"]').type(initialPassword);
    cy.get('input[name="newPassword"]').type('NewPassword123');
    cy.get('input[name="confirmPassword"]').type('NewPassword123');
    cy.contains('button', 'Змінити пароль').click();
    cy.wait('@updateUser');
    cy.contains(
      '[role="alert"]',
      'Не вдалося з’єднатися з JSON Server.'
    ).should('be.visible');
    cy.contains('[role="status"]', 'Пароль успішно змінено.').should(
      'not.exist'
    );
  });

  it('підтверджує вихід і дозволяє його скасувати', () => {
    cy.get('nav[aria-label="Розділи особистого кабінету"]')
      .contains('Налаштування')
      .click();
    cy.contains('button', 'Завершити всі сеанси').should('not.exist');
    cy.contains('button', 'Вийти з облікового запису').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('[role="dialog"] button', 'Скасувати').click();
    cy.location('pathname').should('eq', '/account/settings');
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'knitted-toy-token')
      .should('eq', 'account-test-token');

    cy.get('nav[aria-label="Розділи особистого кабінету"]')
      .contains('button', 'Вийти')
      .click();
    cy.contains('[role="dialog"] button', 'Вийти').click();
    cy.location('pathname').should('eq', '/');
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'knitted-toy-token')
      .should('be.null');
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'knitted-toy-user')
      .should('be.null');
  });
});
