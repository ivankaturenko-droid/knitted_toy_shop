describe('Оформлення замовлення', () => {
  const user = {
    id: 'checkout-test-user',
    name: 'Олена Тестова',
    email: 'checkout-test@example.com',
    phone: '+380 50 123 4567',
  };
  const cartItems = [
    {
      id: 'spider',
      name: 'Стара назва',
      price: 100,
      image: 'old-image.jpg',
      quantity: 2,
    },
  ];
  const product = {
    id: 'spider',
    name: 'Оновлена іграшка',
    price: 375,
    image: '/homepage/images/Rectangle%2010.jpg',
  };

  function visitCheckout({ authenticated = true, items = cartItems } = {}) {
    cy.intercept('GET', '**/api/products', {
      statusCode: 200,
      body: [product],
    }).as('loadProducts');
    cy.visit('/checkout', {
      onBeforeLoad(window) {
        window.localStorage.removeItem('knitted-toy-token');
        window.localStorage.removeItem('knitted-toy-user');
        if (authenticated) {
          window.localStorage.setItem('knitted-toy-token', 'checkout-test');
          window.localStorage.setItem('knitted-toy-user', JSON.stringify(user));
        }
        window.localStorage.setItem('knitted-toy-account-data', '{}');
        window.localStorage.setItem(
          'knitted-toy-carts-by-user',
          JSON.stringify({ [user.id]: items })
        );
      },
    });
    if (authenticated) cy.wait('@loadProducts');
  }

  it('перенаправляє гостя на авторизацію з адресою повернення', () => {
    visitCheckout({ authenticated: false });
    cy.location('pathname').should('eq', '/login');
    cy.location('search').should('contain', 'returnTo=%2Fcheckout');
  });

  it('не дозволяє оформити порожній кошик', () => {
    visitCheckout({ items: [] });
    cy.contains('Додайте товари до кошика перед оформленням.').should(
      'be.visible'
    );
    cy.contains('button', 'Підтвердити замовлення').should('not.exist');
  });

  it('показує умовні поля доставки та перемикає оплату', () => {
    visitCheckout();
    cy.get('input[name="branch"]').should('be.visible');
    cy.get('input[name="deliveryMethod"][value="novaPoshtaLocker"]').check();
    cy.get('input[name="branch"]').should('not.exist');
    cy.get('input[name="lockerNumber"]').should('be.visible');
    cy.get('input[name="deliveryMethod"][value="ukrposhta"]').check();
    cy.get('input[name="lockerNumber"]').should('not.exist');
    cy.get('input[name="street"]').should('be.visible');
    cy.get('input[name="building"]').should('be.visible');
    cy.get('input[name="postalCode"]').should('be.visible');
    cy.contains('button', 'Підтвердити замовлення').click();
    cy.contains('[role="alert"]', 'Вкажіть вулицю.').should('be.visible');
    cy.contains('[role="alert"]', 'Вкажіть номер будинку.').should(
      'be.visible'
    );
    cy.contains('[role="alert"]', 'Вкажіть поштовий індекс.').should(
      'be.visible'
    );
    cy.get('input[name="postalCode"]').type('123');
    cy.contains('button', 'Підтвердити замовлення').click();
    cy.contains('[role="alert"]', 'Індекс має містити 5 цифр.').should(
      'be.visible'
    );

    cy.get('input[name="paymentMethod"][value="cardDemo"]').check();
    cy.get('input[name="paymentMethod"][value="cardDemo"]').should(
      'be.checked'
    );
    cy.contains('Дані картки вводити не потрібно.').should('be.visible');
  });

  it('показує помилки для порожніх та некоректних контактних даних', () => {
    visitCheckout();
    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();
    cy.get('input[name="email"]').clear().type('bad-email');
    cy.get('input[name="phone"]').clear().type('12345');
    cy.get('input[name="city"]').clear();
    cy.get('input[name="branch"]').clear();
    cy.contains('button', 'Підтвердити замовлення').click();

    cy.contains('[role="alert"]', 'Вкажіть ім’я.').should('be.visible');
    cy.contains('[role="alert"]', 'Вкажіть прізвище.').should('be.visible');
    cy.contains('[role="alert"]', 'коректну електронну адресу').should(
      'be.visible'
    );
    cy.contains('[role="alert"]', 'український номер').should('be.visible');
    cy.contains('[role="alert"]', 'Вкажіть місто.').should('be.visible');
    cy.contains('[role="alert"]', 'номер або назву відділення').should(
      'be.visible'
    );
  });

  it('блокує оформлення з некоректною кількістю товару', () => {
    visitCheckout({
      items: [{ ...cartItems[0], quantity: 0 }],
    });
    cy.contains('[role="alert"]', 'некоректною кількістю').should('be.visible');
    cy.contains('button', 'Підтвердити замовлення').should('be.disabled');
  });

  it('використовує актуальну ціну, створює замовлення один раз і очищає кошик', () => {
    visitCheckout();
    cy.contains('Оновлена іграшка').should('be.visible');
    cy.contains('375 грн за одиницю × 2').should('be.visible');
    cy.get('input[name="city"]').type('Львів');
    cy.get('input[name="branch"]').type('12');
    cy.get('textarea').type('Будь ласка, пакування у подарунок.');
    cy.get('input[name="paymentMethod"][value="cardDemo"]').check();
    cy.intercept('POST', '**/api/orders', {
      statusCode: 201,
      body: { id: 'checkout-order-1' },
    }).as('createOrder');

    cy.get('form').then(($form) => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      $form[0].dispatchEvent(event);
      $form[0].dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    });

    cy.wait('@createOrder').its('request.body').should('deep.include', {
      total: 750,
      paymentMethod: 'Оплата на банківську картку',
      comment: 'Будь ласка, пакування у подарунок.',
      deliveryCost: null,
    });
    cy.get('@createOrder')
      .its('request.body.items.0')
      .should('deep.include', { price: 375, quantity: 2 });
    cy.get('@createOrder')
      .its('request.body.customer.address')
      .should('eq', 'Львів, Нова пошта — відділення 12');
    cy.get('@createOrder.all').should('have.length', 1);
    cy.contains('Номер замовлення: checkout-order-1').should('be.visible');
    cy.contains('До історії замовлень').should(
      'have.attr',
      'href',
      '/account/orders'
    );
    cy.window()
      .then((window) =>
        JSON.parse(
          window.localStorage.getItem('knitted-toy-carts-by-user') || '{}'
        )
      )
      .should('deep.equal', { [user.id]: [] });
  });

  it('не очищає кошик і не показує успіх, якщо сервер відхиляє замовлення', () => {
    visitCheckout();
    cy.get('input[name="city"]').type('Львів');
    cy.get('input[name="branch"]').type('12');
    cy.intercept('POST', '**/api/orders', {
      statusCode: 503,
      body: { message: 'Замовлення тимчасово недоступне.' },
    }).as('createOrder');

    cy.contains('button', 'Підтвердити замовлення').click();
    cy.wait('@createOrder');
    cy.contains('[role="alert"]', 'Замовлення тимчасово недоступне.').should(
      'be.visible'
    );
    cy.contains('Дякуємо за замовлення!').should('not.exist');
    cy.window()
      .then((window) =>
        JSON.parse(
          window.localStorage.getItem('knitted-toy-carts-by-user') || '{}'
        )
      )
      .should('deep.equal', { [user.id]: cartItems });
  });
});
