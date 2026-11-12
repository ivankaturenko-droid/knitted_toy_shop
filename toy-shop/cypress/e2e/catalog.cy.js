describe('Каталог іграшок', () => {
  it('використовує однакове стилізування пошуку на головній і в каталозі', () => {
    let homeSearchStyles;
    const properties = [
      'width',
      'min-height',
      'padding',
      'border',
      'border-radius',
      'background-color',
      'box-shadow',
      'color',
      'font-family',
      'font-size',
      'font-weight',
    ];

    cy.visit('/');
    cy.get('button[aria-label="Закрити вікно авторизації"]').click();
    cy.get('#search_toy').then(($input) => {
      const style = window.getComputedStyle($input[0]);
      homeSearchStyles = properties.map((property) =>
        style.getPropertyValue(property)
      );
    });

    cy.visit('/catalog');
    cy.get('input[type="search"]').then(($input) => {
      const style = window.getComputedStyle($input[0]);
      const catalogSearchStyles = properties.map((property) =>
        style.getPropertyValue(property)
      );
      cy.wrap(catalogSearchStyles).should('deep.equal', homeSearchStyles);
    });
  });

  it('показує товари, перемикає категорії та додає товар у кошик', () => {
    cy.visit('/');
    cy.contains('h1', `В'язанка`).should('be.visible');
    cy.get('button[aria-label="Закрити вікно авторизації"]').click();
    cy.get('nav[aria-label="Головна навігація"]')
      .contains('a', 'Каталог')
      .click();
    cy.location('pathname').should('eq', '/catalog');
    cy.contains('h1', 'Каталог').should('be.visible');
    cy.get('article').should('have.length', 13);
    cy.contains('button', 'Колекції').click();
    cy.contains('Динозавр Геннадій').should('be.visible');
    cy.contains('Зайчик Лілі').should('not.exist');
    cy.contains('button', 'Іграшки').click();
    cy.contains('button', 'Додати в кошик').first().click();
    cy.get('header a[aria-label="Кошик, товарів: 1"]').click();
    cy.location('pathname').should('eq', '/cart');
  });
});
