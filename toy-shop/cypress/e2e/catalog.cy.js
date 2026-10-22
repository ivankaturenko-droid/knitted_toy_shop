describe('Каталог іграшок', () => {
  it('відкриває головну сторінку та переходить до каталогу', () => {
    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: [
        {
          id: 'spider',
          name: 'Павук Спідер',
          price: 250,
          description: 'М’який в’язаний павучок ручної роботи.',
          image: '',
        },
      ],
    });

    cy.visit('/');
    cy.contains('h1', 'Маленькі друзі з великою історією').should('be.visible');
    cy.contains('a', 'Переглянути каталог').click();
    cy.location('pathname').should('eq', '/catalog');
    cy.contains('h1', 'Каталог іграшок').should('be.visible');
    cy.contains('Павук Спідер').should('be.visible');
  });
});
