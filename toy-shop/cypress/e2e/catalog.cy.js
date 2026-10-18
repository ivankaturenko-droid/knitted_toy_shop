describe('Каталог іграшок', () => {
  it('показує товари, перемикає категорії та додає товар у кошик', () => {
    cy.visit('/');
    cy.contains('h1', 'Маленькі друзі з великою історією').should('be.visible');
    cy.contains('a', 'Переглянути каталог').click();
    cy.location('pathname').should('eq', '/catalog');
    cy.contains('h1', 'Каталог').should('be.visible');
    cy.get('article').should('have.length', 9);
    cy.contains('button', 'Колекції').click();
    cy.contains('Динозавр Геннадій').should('be.visible');
    cy.contains('Зайчик Лілі').should('not.exist');
    cy.contains('button', 'Іграшки').click();
    cy.contains('button', 'Додати в кошик').first().click();
    cy.get('header a[aria-label="Кошик, товарів: 1"]').click();
    cy.location('pathname').should('eq', '/cart');
  });
});
